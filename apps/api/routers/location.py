"""
Location Router — find nearby hospitals, pharmacies, and Jan Aushadhi stores
using OpenStreetMap Overpass API (free, no API key needed).
"""

import math
from fastapi import APIRouter, Depends, HTTPException, Query
import httpx

from services.auth import get_current_user_id

router = APIRouter()

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two lat/lon points in kilometers."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/nearby")
async def nearby(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    type: str = Query("all", description="hospital, pharmacy, or all"),
    radius: int = Query(10000, description="Search radius in meters (default 10km)"),
    _user_id: str = Depends(get_current_user_id),
):
    """Find nearby hospitals and pharmacies using OpenStreetMap."""
    if not (-90 <= lat <= 90):
        raise HTTPException(status_code=422, detail="lat must be between -90 and 90")
    if not (-180 <= lon <= 180):
        raise HTTPException(status_code=422, detail="lon must be between -180 and 180")
    if not (100 <= radius <= 50000):
        raise HTTPException(status_code=422, detail="radius must be between 100 and 50000 meters")

    # Build Overpass query based on type
    filters = []
    if type in ("hospital", "all"):
        filters.append(f'node["amenity"="hospital"](around:{radius},{lat},{lon});')
        filters.append(f'way["amenity"="hospital"](around:{radius},{lat},{lon});')
        filters.append(f'node["amenity"="clinic"](around:{radius},{lat},{lon});')
        filters.append(f'way["amenity"="clinic"](around:{radius},{lat},{lon});')
        filters.append(f'node["healthcare"="hospital"](around:{radius},{lat},{lon});')
    if type in ("pharmacy", "all"):
        filters.append(f'node["amenity"="pharmacy"](around:{radius},{lat},{lon});')
        filters.append(f'way["amenity"="pharmacy"](around:{radius},{lat},{lon});')
        filters.append(f'node["shop"="chemist"](around:{radius},{lat},{lon});')

    overpass_query = f"""
    [out:json][timeout:15];
    (
      {chr(10).join(filters)}
    );
    out center body;
    """

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                OVERPASS_URL,
                data={"data": overpass_query},
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Location search failed: {str(e)}")

    results = []
    seen_names = set()

    for element in data.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name", tags.get("name:en", ""))
        if not name:
            continue

        # Deduplicate by name (way + node can duplicate)
        if name.lower() in seen_names:
            continue
        seen_names.add(name.lower())

        # Get coordinates (ways use center, nodes use lat/lon directly)
        el_lat = element.get("lat") or element.get("center", {}).get("lat")
        el_lon = element.get("lon") or element.get("center", {}).get("lon")
        if el_lat is None or el_lon is None:
            continue

        distance = haversine_km(lat, lon, el_lat, el_lon)

        # Determine type
        amenity = tags.get("amenity", tags.get("healthcare", tags.get("shop", "")))
        if amenity in ("hospital", "clinic"):
            place_type = "hospital"
        elif amenity in ("pharmacy", "chemist"):
            place_type = "pharmacy"
        else:
            place_type = amenity or "other"

        results.append(
            {
                "name": name,
                "type": place_type,
                "lat": el_lat,
                "lon": el_lon,
                "distance_km": round(distance, 2),
                "address": tags.get("addr:full", tags.get("addr:street", "")),
                "phone": tags.get("phone", tags.get("contact:phone", "")),
                "opening_hours": tags.get("opening_hours", ""),
            }
        )

    # Sort by distance
    results.sort(key=lambda x: x["distance_km"])

    return {"results": results[:50], "total": len(results), "radius_km": radius / 1000}

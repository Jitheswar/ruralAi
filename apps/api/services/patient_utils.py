"""Shared patient lookup utilities."""

from supabase import Client


def get_or_create_self_patient(
    supabase: Client,
    user_id: str,
    age: int | None = None,
    gender: str | None = None,
) -> str | None:
    """Find or create a 'self' patient record for the given user.

    Returns the patient_id, or None if creation failed.
    """
    # Preferred lookup: explicit self-profile marker.
    try:
        res = (
            supabase.table("patients")
            .select("id")
            .eq("created_by", user_id)
            .eq("is_self_profile", True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]["id"]
    except Exception:
        # Backward compatibility before self-profile migration is applied.
        pass

    # Backward compatibility: promote legacy rows named "My Health Profile".
    legacy_res = (
        supabase.table("patients")
        .select("id")
        .eq("created_by", user_id)
        .eq("name", "My Health Profile")
        .limit(1)
        .execute()
    )
    if legacy_res.data:
        patient_id = legacy_res.data[0]["id"]
        try:
            supabase.table("patients").update(
                {"is_self_profile": True, "user_id": user_id}
            ).eq("id", patient_id).execute()
        except Exception:
            # Ignore if migration is not yet applied.
            pass
        return patient_id

    new_patient: dict = {
        "created_by": user_id,
        "name": "My Health Profile",
        "is_self_profile": True,
        "user_id": user_id,
    }
    if age is not None:
        new_patient["age"] = age
    if gender is not None:
        new_patient["gender"] = gender

    try:
        create_res = supabase.table("patients").insert(new_patient).execute()
    except Exception:
        # Backward compatibility before self-profile migration is applied.
        fallback_payload = {
            "created_by": user_id,
            "name": "My Health Profile",
        }
        if age is not None:
            fallback_payload["age"] = age
        if gender is not None:
            fallback_payload["gender"] = gender
        create_res = supabase.table("patients").insert(fallback_payload).execute()
    if create_res.data:
        return create_res.data[0]["id"]
    return None

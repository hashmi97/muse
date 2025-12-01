import os
import json
import requests

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:4000")
EMAIL = os.getenv("E2E_EMAIL", "groom@example.com")
PASSWORD = os.getenv("E2E_PASSWORD", "Password123")
EVENT_KEY = os.getenv("E2E_EVENT_KEY", "wedding_night")

session = requests.Session()

def pretty(label, resp):
    try:
        data = resp.json()
    except Exception:
        data = resp.text
    print(f"\n=== {label} ({resp.status_code}) ===")
    print(json.dumps(data, indent=2, default=str))

def signup():
    resp = session.post(f"{BASE_URL}/api/auth/signup/", json={"email": EMAIL, "password": PASSWORD, "full_name": "Groom User"})
    pretty("Signup", resp)
    if resp.status_code not in (200, 201):
        return login()
    return resp.json()["data"]["access"], resp.json()["data"].get("refresh")

def login():
    resp = session.post(f"{BASE_URL}/api/auth/login/", json={"email": EMAIL, "password": PASSWORD})
    pretty("Login", resp)
    resp.raise_for_status()
    return resp.json()["data"]["access"], resp.json()["data"].get("refresh")

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

def event_types(token):
    resp = session.get(f"{BASE_URL}/api/events/types/?onboardingOnly=true", headers=auth_headers(token))
    pretty("Event types", resp)

def selection(token):
    body = {"selections": [{"eventTypeKey": EVENT_KEY, "title": "Our Wedding", "enableMoodboard": True}]}
    resp = session.post(f"{BASE_URL}/api/events/selection/", json=body, headers=auth_headers(token))
    pretty("Event selection", resp)
    resp.raise_for_status()
    data = resp.json()["data"]
    if not data:
        raise RuntimeError("No events returned")
    return data[0]["id"]

def upload_media(token):
    files = {"file": ("test.jpg", b"dummy", "image/jpeg")}
    resp = session.post(f"{BASE_URL}/api/media/upload/", files=files, headers=auth_headers(token))
    pretty("Upload media", resp)
    resp.raise_for_status()
    return resp.json()["data"]["id"]

def moodboard_item(token, event_id, media_id):
    resp = session.post(f"{BASE_URL}/api/moodboard/{event_id}/items/", json={"media_id": media_id, "caption": "nice"}, headers=auth_headers(token))
    pretty("Moodboard add", resp)
    resp.raise_for_status()
    item_id = resp.json()["data"]["id"]
    resp = session.get(f"{BASE_URL}/api/moodboard/{event_id}/", headers=auth_headers(token))
    pretty("Moodboard list", resp)
    return item_id

def calendar(token):
    resp = session.get(f"{BASE_URL}/api/calendar/", headers=auth_headers(token))
    pretty("Calendar", resp)

def budget(token, event_id):
    # assumes a category with id=1 exists (e.g., seeded). Skip failures.
    cat_id = 1
    resp = session.post(f"{BASE_URL}/api/events/{event_id}/budget/", json={"category_id": cat_id}, headers=auth_headers(token))
    pretty("Budget attach", resp)

def honeymoon(token, event_id):
    resp = session.post(
        f"{BASE_URL}/api/events/{event_id}/honeymoon/",
        json={"destination_country": "OM", "destination_city": "Muscat"},
        headers=auth_headers(token),
    )
    pretty("Honeymoon upsert", resp)

def main():
    try:
        access, _ = signup()
    except Exception:
        access, _ = login()
    event_types(access)
    event_id = selection(access)
    calendar(access)
    media_id = upload_media(access)
    moodboard_item(access, event_id, media_id)
    budget(access, event_id)
    honeymoon(access, event_id)
    print("\nFlow complete")

if __name__ == "__main__":
    main()

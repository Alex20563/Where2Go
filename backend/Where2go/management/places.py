import math
from urllib.parse import quote

import requests
from django.conf import settings


def get_places_with_meta(base_lat, base_lon, category, radius=1000, min_rating=4.0):
    places = get_2gis_places(
        base_lat=base_lat,
        base_lon=base_lon,
        category=category,
        radius=radius,
        min_rating=min_rating,
    )
    return {
        "search_point": {"lat": base_lat, "lon": base_lon, "radius": radius},
        "places": places,
    }


def get_2gis_places(base_lat, base_lon, category, radius=500, min_rating=4.0):
    url = "https://catalog.api.2gis.com/3.0/items"

    params = {
        "q": category,
        "point": f"{base_lon},{base_lat}",
        "radius": radius,
        "type": "branch",
        "fields": "items.point,items.reviews,items.address",
        "key": settings.DGIS_API_KEY,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        for item in data.get("result", {}).get("items", []):
            rating = item.get("reviews", {}).get("rating", 0)
            if rating >= min_rating:
                place_lat = item["point"]["lat"]
                place_lon = item["point"]["lon"]
                distance = calculate_distance(base_lat, base_lon, place_lat, place_lon)

                results.append(
                    {
                        "name": item["name"],
                        "address": item.get("address_name"),
                        "rating": rating,
                        "reviews_count": item.get("reviews", {}).get("count", 0),
                        "coordinates": {"lat": place_lat, "lon": place_lon},
                        "distance": distance,
                        "2gis_link": generate_2gis_link(
                            place_lat, place_lon, item["name"]
                        ),
                        "direction_links": {
                            "google": generate_direction_link(
                                "google", place_lat, place_lon
                            ),
                            "yandex": generate_direction_link(
                                "yandex", place_lat, place_lon
                            ),
                        },
                    }
                )

        results.sort(key=lambda x: x["distance"])
        return results

    except requests.exceptions.RequestException as e:
        print(f"2GIS API error: {e}")
        return []


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def generate_2gis_link(lat, lon, name):
    return f"https://2gis.ru/search/{quote(name)}"


def generate_direction_link(service, to_lat, to_lon):
    if service == "google":
        return f"https://www.google.com/maps/dir/?api=1&destination={to_lat},{to_lon}"
    elif service == "yandex":
        return f"https://yandex.ru/maps/?rtext={to_lat}%2C{to_lon}&rtt=auto"

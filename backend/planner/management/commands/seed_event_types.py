from django.core.management.base import BaseCommand
from planner.models import EventType


class Command(BaseCommand):
    help = "Seed event types for wedding planning"

    def handle(self, *args, **options):
        event_types = [
            {
                "key": "engagement",
                "name_en": "Engagement",
                "name_ar": "الخطوبة",
                "default_color_hex": "#FFB6C1",
                "default_moodboard_enabled": False,
            },
            {
                "key": "malka",
                "name_en": "Malka",
                "name_ar": "الملكة",
                "default_color_hex": "#FFC0CB",
                "default_moodboard_enabled": True,
            },
            {
                "key": "henna_night",
                "name_en": "Henna Night",
                "name_ar": "ليلة الحناء",
                "default_color_hex": "#FF69B4",
                "default_moodboard_enabled": True,
            },
            {
                "key": "bride_prep",
                "name_en": "Bride Preparation",
                "name_ar": "تحضيرات العروس",
                "default_color_hex": "#FF1493",
                "default_moodboard_enabled": True,
            },
            {
                "key": "wedding_night",
                "name_en": "Wedding Night",
                "name_ar": "ليلة الزفاف",
                "default_color_hex": "#DC143C",
                "default_moodboard_enabled": True,
            },
            {
                "key": "honeymoon",
                "name_en": "Honeymoon",
                "name_ar": "شهر العسل",
                "default_color_hex": "#FF6347",
                "default_moodboard_enabled": True,
            },
        ]

        created_count = 0
        updated_count = 0

        for et_data in event_types:
            obj, created = EventType.objects.update_or_create(
                key=et_data["key"], defaults=et_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created event type: {et_data["key"]}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated event type: {et_data["key"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeding complete: {created_count} created, {updated_count} updated"
            )
        )


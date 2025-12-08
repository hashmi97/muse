from django.core.management.base import BaseCommand
from planner.models import BudgetCategory


class Command(BaseCommand):
    help = "Seed budget categories for wedding planning"

    def handle(self, *args, **options):
        categories = [
            {"key": "venue", "label": "Venue", "sort_order": 1, "is_default_for_omani": True},
            {"key": "catering", "label": "Catering", "sort_order": 2, "is_default_for_omani": True},
            {"key": "photography", "label": "Photography & Videography", "sort_order": 3, "is_default_for_omani": True},
            {"key": "decorations", "label": "Decorations & Flowers", "sort_order": 4, "is_default_for_omani": True},
            {"key": "music", "label": "Music & Entertainment", "sort_order": 5, "is_default_for_omani": True},
            {"key": "attire", "label": "Bridal & Groom Attire", "sort_order": 6, "is_default_for_omani": True},
            {"key": "makeup", "label": "Hair & Makeup", "sort_order": 7, "is_default_for_omani": True},
            {"key": "transportation", "label": "Transportation", "sort_order": 8, "is_default_for_omani": True},
            {"key": "invitations", "label": "Invitations & Stationery", "sort_order": 9, "is_default_for_omani": True},
            {"key": "gifts", "label": "Gifts & Favors", "sort_order": 10, "is_default_for_omani": True},
            {"key": "officiant", "label": "Officiant & Legal", "sort_order": 11, "is_default_for_omani": False},
            {"key": "accommodation", "label": "Accommodation", "sort_order": 12, "is_default_for_omani": False},
            {"key": "other", "label": "Other Expenses", "sort_order": 99, "is_default_for_omani": False},
        ]

        created_count = 0
        updated_count = 0

        for cat_data in categories:
            obj, created = BudgetCategory.objects.update_or_create(
                key=cat_data["key"], defaults=cat_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created budget category: {cat_data["label"]}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated budget category: {cat_data["label"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeding complete: {created_count} created, {updated_count} updated"
            )
        )


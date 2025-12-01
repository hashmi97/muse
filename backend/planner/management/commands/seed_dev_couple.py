from django.core.management.base import BaseCommand
from accounts.models import User
from planner.models import Couple, CoupleMember, EventType, Event


class Command(BaseCommand):
    help = "Create a dev couple/membership and a default event for a given user email."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="User email to attach to the couple")
        parser.add_argument("--event-key", default="wedding_night", help="Event type key to create")

    def handle(self, *args, **options):
        email = options["email"]
        event_key = options["event_key"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"User {email} not found."))
            return

        couple, _ = Couple.objects.get_or_create(name="Dev Couple")
        CoupleMember.objects.get_or_create(
            couple=couple,
            user=user,
            defaults={"status": "active", "role": "bride", "is_owner": True},
        )

        et, _ = EventType.objects.get_or_create(key=event_key, defaults={"name_en": event_key.replace("_", " ").title()})
        event, _ = Event.objects.get_or_create(couple=couple, event_type=et, defaults={"title": et.name_en})

        self.stdout.write(
            self.style.SUCCESS(
                f"Couple {couple.id} ready, membership for {email} active, event_id={event.id} (key={event_key})"
            )
        )

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("planner", "0002_budgetcategory_eventbudget_honeymoonplan_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="CoupleInvite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(max_length=254)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("sent", "Sent"), ("accepted", "Accepted")], default="pending", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("couple", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="invites", to="planner.couple")),
            ],
            options={
                "unique_together": {("couple", "email")},
            },
        ),
    ]

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('bride', 'groom', 'other');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('bride', 'groom', 'viewer', 'editor');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('invited', 'active', 'left');

-- CreateEnum
CREATE TYPE "LanguagePref" AS ENUM ('en', 'ar', 'hybrid');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('heart');

-- CreateEnum
CREATE TYPE "HoneymoonItemType" AS ENUM ('flight', 'hotel', 'activity', 'other');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "CommentTargetType" AS ENUM ('event', 'mood_board_item', 'budget_line_item', 'honeymoon_item', 'task');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "avatar_media_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couples" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "wedding_date" TIMESTAMP(3),
    "language_pref" "LanguagePref" NOT NULL,
    "theme" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_members" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "MemberRole" NOT NULL,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "status" "MemberStatus" NOT NULL DEFAULT 'invited',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "couple_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT,
    "default_color_hex" TEXT,
    "default_moodboard_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "event_type_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_boards" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_board_items" (
    "id" SERIAL NOT NULL,
    "mood_board_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "caption" TEXT,
    "position" INTEGER,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_board_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_board_reactions" (
    "id" SERIAL NOT NULL,
    "mood_board_item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reaction_type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_board_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_budgets" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "currency_code" TEXT NOT NULL,
    "total_planned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default_for_omani" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_budget_categories" (
    "id" SERIAL NOT NULL,
    "event_budget_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "planned_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "spent_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "event_budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_line_items" (
    "id" SERIAL NOT NULL,
    "event_budget_category_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "planned_amount" DECIMAL(12,2),
    "actual_amount" DECIMAL(12,2),
    "notes" TEXT,
    "paid_on" TIMESTAMP(3),
    "receipt_media_id" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honeymoon_plans" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "destination_country" TEXT NOT NULL,
    "destination_city" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "total_planned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "honeymoon_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honeymoon_items" (
    "id" SERIAL NOT NULL,
    "honeymoon_plan_id" INTEGER NOT NULL,
    "type" "HoneymoonItemType" NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "planned_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "provider_name" TEXT,
    "booking_ref" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honeymoon_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "due_date" TIMESTAMP(3),
    "assigned_to" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "target_type" "CommentTargetType" NOT NULL,
    "target_id" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" SERIAL NOT NULL,
    "couple_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "action_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link_entity_type" TEXT,
    "link_entity_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_avatar_media_id_key" ON "users"("avatar_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "couple_members_couple_id_user_id_key" ON "couple_members"("couple_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_types_key_key" ON "event_types"("key");

-- CreateIndex
CREATE UNIQUE INDEX "mood_boards_event_id_key" ON "mood_boards"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "mood_board_reactions_mood_board_item_id_user_id_reaction_ty_key" ON "mood_board_reactions"("mood_board_item_id", "user_id", "reaction_type");

-- CreateIndex
CREATE UNIQUE INDEX "event_budgets_event_id_key" ON "event_budgets"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_key_key" ON "budget_categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "event_budget_categories_event_budget_id_category_id_key" ON "event_budget_categories"("event_budget_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "honeymoon_plans_event_id_key" ON "honeymoon_plans"("event_id");

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "activity_log_entity_type_entity_id_idx" ON "activity_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_media_id_fkey" FOREIGN KEY ("avatar_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_boards" ADD CONSTRAINT "mood_boards_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_items" ADD CONSTRAINT "mood_board_items_mood_board_id_fkey" FOREIGN KEY ("mood_board_id") REFERENCES "mood_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_items" ADD CONSTRAINT "mood_board_items_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_items" ADD CONSTRAINT "mood_board_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_reactions" ADD CONSTRAINT "mood_board_reactions_mood_board_item_id_fkey" FOREIGN KEY ("mood_board_item_id") REFERENCES "mood_board_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_board_reactions" ADD CONSTRAINT "mood_board_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_budgets" ADD CONSTRAINT "event_budgets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_budget_categories" ADD CONSTRAINT "event_budget_categories_event_budget_id_fkey" FOREIGN KEY ("event_budget_id") REFERENCES "event_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_budget_categories" ADD CONSTRAINT "event_budget_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line_items" ADD CONSTRAINT "budget_line_items_event_budget_category_id_fkey" FOREIGN KEY ("event_budget_category_id") REFERENCES "event_budget_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line_items" ADD CONSTRAINT "budget_line_items_receipt_media_id_fkey" FOREIGN KEY ("receipt_media_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_line_items" ADD CONSTRAINT "budget_line_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honeymoon_plans" ADD CONSTRAINT "honeymoon_plans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honeymoon_items" ADD CONSTRAINT "honeymoon_items_honeymoon_plan_id_fkey" FOREIGN KEY ("honeymoon_plan_id") REFERENCES "honeymoon_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight_kg" REAL NOT NULL,
    "height_cm" REAL NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "activity_level" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "calorie_target" INTEGER NOT NULL,
    "protein_target_g" INTEGER NOT NULL,
    "carbs_target_g" INTEGER NOT NULL,
    "fat_target_g" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein_g" REAL NOT NULL,
    "carbs_g" REAL NOT NULL,
    "fat_g" REAL NOT NULL,
    "fiber_g" REAL,
    "serving_size" REAL NOT NULL,
    "serving_unit" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "external_id" TEXT,
    "created_by" TEXT,
    CONSTRAINT "FoodItem_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "food_item_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "meal_type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "calories" REAL NOT NULL,
    "protein_g" REAL NOT NULL,
    "carbs_g" REAL NOT NULL,
    "fat_g" REAL NOT NULL,
    CONSTRAINT "DiaryEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiaryEntry_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "food_item_id" TEXT NOT NULL,
    "preference" TEXT NOT NULL DEFAULT 'neutral',
    "frequency_count" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "UserPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPreference_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "FoodItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggestion_text" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "foods_suggested" TEXT NOT NULL,
    "was_accepted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Recommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailySummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "total_calories" REAL NOT NULL,
    "total_protein" REAL NOT NULL,
    "total_carbs" REAL NOT NULL,
    "total_fat" REAL NOT NULL,
    "goal_met" BOOLEAN NOT NULL,
    CONSTRAINT "DailySummary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "weight_kg" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "WeightLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "total_calories" REAL NOT NULL,
    "total_protein" REAL NOT NULL,
    "total_carbs" REAL NOT NULL,
    "total_fat" REAL NOT NULL,
    CONSTRAINT "CustomMeal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_user_id_food_item_id_key" ON "UserPreference"("user_id", "food_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_user_id_date_key" ON "DailySummary"("user_id", "date");

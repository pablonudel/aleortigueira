/*
  Warnings:

  - Made the column `categoryId` on table `project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_categoryId_fkey";

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "year" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

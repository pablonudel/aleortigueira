-- AlterTable
CREATE SEQUENCE project_order_seq;
ALTER TABLE "project" ALTER COLUMN "order" SET DEFAULT nextval('project_order_seq');
ALTER SEQUENCE project_order_seq OWNED BY "project"."order";

import { makeCrud } from "@/lib/api/crud";

// delivery customers 数据服务端化 CRUD
const crud = makeCrud({ table: "delivery_customers" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

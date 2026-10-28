import { makeCrud } from "@/lib/api/crud";

// purchase orders 数据服务端化 CRUD
const crud = makeCrud({ table: "purchase_orders" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

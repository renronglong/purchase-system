import { makeCrud } from "@/lib/api/crud";

// delivery products 数据服务端化 CRUD
const crud = makeCrud({ table: "delivery_products" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

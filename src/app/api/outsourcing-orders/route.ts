import { makeCrud } from "@/lib/api/crud";

// outsourcing orders 数据服务端化 CRUD
const crud = makeCrud({ table: "outsourcing_orders" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

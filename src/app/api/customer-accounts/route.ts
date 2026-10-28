import { makeCrud } from "@/lib/api/crud";

// customer accounts 数据服务端化 CRUD
const crud = makeCrud({ table: "customer_accounts" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

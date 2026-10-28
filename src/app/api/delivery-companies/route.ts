import { makeCrud } from "@/lib/api/crud";

// delivery companies 数据服务端化 CRUD
const crud = makeCrud({ table: "delivery_companies" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

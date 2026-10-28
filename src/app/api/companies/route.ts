import { makeCrud } from "@/lib/api/crud";

// companies 数据服务端化 CRUD
const crud = makeCrud({ table: "companies" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

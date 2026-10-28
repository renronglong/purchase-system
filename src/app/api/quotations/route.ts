import { makeCrud } from "@/lib/api/crud";

// quotations 数据服务端化 CRUD
const crud = makeCrud({ table: "quotations" });

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;

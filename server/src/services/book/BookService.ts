import { validateInputWithZod } from "@/helper/validation/validateInput";
import { BookCreateZodSchema, IBookCreateInput } from "@/validations/book/BookZod";
import { fetch } from "bun";

const createBook = async (data: IBookCreateInput) => {
  const { file } = await validateInputWithZod(BookCreateZodSchema, data);

  await fetch(`${Bun.env.FAST_IO_API_KEY}`, {
    headers: {
      "Authorization": "Bearer ",
    }
  });
};

export { createBook };

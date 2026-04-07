import { validateInputWithZod } from "@/helper/validation/validateInput";
import { BookCreateZodSchema, IBookCreateInput } from "@/validations/book/BookZod";

const createBook = async (data: IBookCreateInput) => {
  const { file } = await validateInputWithZod(BookCreateZodSchema, data);
  
  
};

export { createBook };

//Функция для настройки сортировки и отображение товаров, относительно выбранной сортировки

import { prisma } from "@/prisma/prisma-client";

export interface GetSearchParams {
    query?: string;
    sortBy?: string;
    sizes?: string;
    pizzaTypes?: string;
    ingredients?: string;
    priceFrom?: string;
    priceTo?: string;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

export const findPizzas = async (params: GetSearchParams) => {
    const sizes = params.sizes?.split(',').map(Number);
    const pizzaTypes = params.pizzaTypes?.split(',').map(Number);
    const ingredientsIdArr = params.ingredients?.split(',').map(Number);

    const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
    const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;

    const categories = await prisma.category.findMany({
        include:{
          products:{
            orderBy:{
                id: 'desc',
            },

            where:{
                //Один из ингредиентов в массиве, должен быть в продукте
                ingredients: ingredientsIdArr ? {
                    some:{
                        //Поиск производить по айди, который находится внутри массива ингредиентов
                        id:{
                            in: ingredientsIdArr
                        }
                    }
                } : undefined,

                productItems:{
                    some:{
                        size: {
                            in: sizes,
                        },
                        pizzaType:{
                            in: pizzaTypes,
                        },
                        price:{
                            gte: minPrice,
                            lte: maxPrice,
                        },
                    }
                },
                
            },

            include:{
              ingredients: true,
              productItems: {
                where:{
                    price: {
                        gte: minPrice,
                        lte: maxPrice,
                    },
                },
                orderBy:{
                    price: 'asc',
                },
              },
            }
          }
        }
    })

    return categories;
}
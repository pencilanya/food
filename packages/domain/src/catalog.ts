import type { FoodItem } from "./types.ts";
const item = (value: FoodItem) => value;
export const mockCatalog: FoodItem[] = [
  item({ id:"turkey-sandwich", title:"Сэндвич с индейкой", description:"Цельнозерновой хлеб и индейка", category:"sandwiches", allowedSlots:["main"], proteinGrams:18, fiberGrams:4, sugarGrams:3, allergens:["gluten"], tags:["protein","fiber","whole_grain","filling"], priceKopecks:23500, emoji:"🥪", provider:"mock" }),
  item({ id:"cheese-wrap", title:"Ролл с сыром", description:"Мягкая тортилья, сыр и овощи", category:"mains", allowedSlots:["main"], proteinGrams:14, fiberGrams:3, sugarGrams:4, allergens:["gluten","milk"], tags:["protein","dairy","filling"], priceKopecks:21000, emoji:"🌯", provider:"mock" }),
  item({ id:"chicken-rice", title:"Курочка с рисом", category:"mains", allowedSlots:["main"], proteinGrams:22, fiberGrams:2, sugarGrams:2, allergens:[], tags:["protein","filling","low_sugar"], priceKopecks:26000, emoji:"🍚", provider:"mock" }),
  item({ id:"hummus-pita", title:"Пита с хумусом", category:"mains", allowedSlots:["main"], proteinGrams:10, fiberGrams:6, sugarGrams:3, allergens:["gluten","sesame"], tags:["protein","fiber","filling"], priceKopecks:19000, emoji:"🫓", provider:"mock" }),
  item({ id:"egg-muffin", title:"Яичный маффин", category:"mains", allowedSlots:["main"], proteinGrams:15, sugarGrams:2, allergens:["egg","milk"], tags:["protein","filling","low_sugar"], priceKopecks:17500, emoji:"🍳", provider:"mock" }),
  item({ id:"yogurt", title:"Йогурт с ягодами", category:"dairy", allowedSlots:["snack"], proteinGrams:8, sugarGrams:8, allergens:["milk"], tags:["protein","dairy","fresh"], priceKopecks:10500, emoji:"🥛", provider:"mock" }),
  item({ id:"oat-bites", title:"Овсяные шарики", category:"snacks", allowedSlots:["snack"], fiberGrams:5, sugarGrams:5, allergens:["gluten"], tags:["fiber","whole_grain","crunchy"], priceKopecks:8500, emoji:"🧆", provider:"mock" }),
  item({ id:"nut-bar", title:"Ореховый батончик", category:"snacks", allowedSlots:["snack"], proteinGrams:6, fiberGrams:4, sugarGrams:7, allergens:["nuts","peanuts"], tags:["protein","fiber","crunchy"], priceKopecks:9000, emoji:"🥜", provider:"mock" }),
  item({ id:"crackers", title:"Цельнозерновые крекеры", category:"snacks", allowedSlots:["snack"], fiberGrams:3, sugarGrams:2, allergens:["gluten"], tags:["whole_grain","crunchy","low_sugar"], priceKopecks:7000, emoji:"🫓", provider:"mock" }),
  item({ id:"cheese-cubes", title:"Сырные кубики", category:"dairy", allowedSlots:["snack"], proteinGrams:9, sugarGrams:1, allergens:["milk"], tags:["protein","dairy","low_sugar"], priceKopecks:11500, emoji:"🧀", provider:"mock" }),
  item({ id:"chips", title:"Хрустящие чипсы", category:"snacks", allowedSlots:["snack"], sugarGrams:1, allergens:[], tags:["junk","crunchy"], priceKopecks:6500, emoji:"🍟", provider:"mock" }),
  item({ id:"apple", title:"Яблоко", category:"fruits", allowedSlots:["fruit_or_vegetable"], fiberGrams:4, sugarGrams:10, allergens:[], tags:["fruit","fiber","fresh"], priceKopecks:5500, emoji:"🍎", provider:"mock" }),
  item({ id:"pear", title:"Груша", category:"fruits", allowedSlots:["fruit_or_vegetable"], fiberGrams:5, sugarGrams:10, allergens:[], tags:["fruit","fiber","fresh"], priceKopecks:6500, emoji:"🍐", provider:"mock" }),
  item({ id:"berries", title:"Ягодный микс", category:"fruits", allowedSlots:["fruit_or_vegetable"], fiberGrams:4, sugarGrams:7, allergens:[], tags:["fruit","fiber","fresh","low_sugar"], priceKopecks:12500, emoji:"🍓", provider:"mock" }),
  item({ id:"carrots", title:"Морковные палочки", category:"vegetables", allowedSlots:["fruit_or_vegetable"], fiberGrams:4, sugarGrams:5, allergens:[], tags:["vegetable","fiber","fresh","crunchy"], priceKopecks:6000, emoji:"🥕", provider:"mock" }),
  item({ id:"cucumber", title:"Огуречные кружочки", category:"vegetables", allowedSlots:["fruit_or_vegetable"], fiberGrams:2, sugarGrams:2, allergens:[], tags:["vegetable","fresh","crunchy","low_sugar"], priceKopecks:5000, emoji:"🥒", provider:"mock" }),
  item({ id:"banana", title:"Банан", category:"fruits", allowedSlots:["fruit_or_vegetable"], fiberGrams:3, sugarGrams:12, allergens:[], tags:["fruit","fresh","filling"], priceKopecks:5000, emoji:"🍌", provider:"mock" }),
  item({ id:"water", title:"Вода", category:"drinks", allowedSlots:["drink"], sugarGrams:0, allergens:[], tags:["fresh","low_sugar"], priceKopecks:4500, emoji:"💧", provider:"mock" }),
  item({ id:"berry-water", title:"Вода с ягодами", category:"drinks", allowedSlots:["drink"], sugarGrams:2, allergens:[], tags:["fresh","low_sugar"], priceKopecks:6500, emoji:"🧃", provider:"mock" }),
  item({ id:"kefir", title:"Кефир", category:"dairy", allowedSlots:["drink"], proteinGrams:6, sugarGrams:5, allergens:["milk"], tags:["protein","dairy","fresh"], priceKopecks:7500, emoji:"🥛", provider:"mock" }),
  item({ id:"apple-juice", title:"Яблочный сок", category:"drinks", allowedSlots:["drink"], sugarGrams:18, allergens:[], tags:["fruit"], priceKopecks:8000, emoji:"🧃", provider:"mock" }),
  item({ id:"cocoa", title:"Какао", category:"drinks", allowedSlots:["drink"], proteinGrams:5, sugarGrams:14, allergens:["milk"], tags:["dairy"], priceKopecks:9000, emoji:"☕", provider:"mock" }),
];
export class MockCatalogProvider { async getItems(): Promise<FoodItem[]> { return mockCatalog; } }

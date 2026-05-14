import prisma from "../src/config/prismaClient.js";

const foods = [
  { name: "Mì Quảng", description: "Món ăn đặc trưng của Quảng Nam - Đà Nẵng với sợi mì dày và nước dùng đậm đà.", price: 35000, address: "Đà Nẵng", category: "Đặc sản" },
  { name: "Bánh tráng cuốn thịt heo", description: "Món cuốn dân dã với thịt heo luộc, rau sống và mắm nêm.", price: 50000, address: "Đà Nẵng", category: "Đặc sản" },
  { name: "Bún chả Hà Nội", description: "Thịt nướng thơm lừng ăn kèm bún và nước chấm chua ngọt.", price: 45000, address: "Hà Nội", category: "Đặc sản" },
  { name: "Phở Bò", description: "Món ăn quốc hồn quốc túy của Việt Nam.", price: 50000, address: "Hà Nội", category: "Đặc sản" },
  { name: "Cơm Tấm Sài Gòn", description: "Cơm làm từ hạt gạo vỡ, ăn kèm sườn nướng, chả trứng và bì.", price: 40000, address: "Hồ Chí Minh", category: "Đặc sản" },
  { name: "Bánh mì Sài Gòn", description: "Ổ bánh mì giòn tan với đầy đủ nhân thịt, chả, pate.", price: 25000, address: "Hồ Chí Minh", category: "Đặc sản" },
  { name: "Bún Bò Huế", description: "Món bún cay nồng đặc trưng của cố đô Huế.", price: 45000, address: "Thừa Thiên Huế", category: "Đặc sản" }
];

async function seed() {
  console.log("Starting seed foods...");
  
  for (const item of foods) {
    try {
      const existing = await prisma.food.findFirst({
        where: { name: item.name }
      });

      if (!existing) {
        await prisma.food.create({
          data: {
            name: item.name,
            description: item.description,
            price: item.price,
            address: item.address,
            category: item.category,
            imageUrl: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80`
          }
        });
        console.log(`- Created Food: ${item.name}`);
      }
    } catch (err) {
      console.error(`- Failed Food: ${item.name}`, err.message);
    }
  }

  console.log("Food seed finished!");
  process.exit(0);
}

seed();

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CarResponse } from "@/types/cars";

export function useCars(filters?: Record<string, string>) {
  return useQuery<CarResponse[]>({
    queryKey: ['cars', filters],
    queryFn: async () => {
      const params = filters ? { ...filters } : {};
      try {
        const res = await apiClient.get('/cars', { params }) as any;
        const data = Array.isArray(res) ? res : (res?.data || []);
        if (data.length > 0) return data;
      } catch (err) {
        console.error('Failed to fetch cars:', err);
      }

      // Fallback mock data
      return [
        {
          id: 1,
          name: "Mercedes-Benz G-Class",
          brand: "Mercedes",
          model: "G63 AMG",
          price_per_day: 150000,
          release_year: 2023,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [{ url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 1
        },
        {
          id: 2,
          name: "Toyota Land Cruiser 300",
          brand: "Toyota",
          model: "LC300",
          price_per_day: 85000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Дизель",
          city: "Астана",
          images: [{ url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 1
        },
        {
          id: 3,
          name: "BMW M5 Competition",
          brand: "BMW",
          model: "M5",
          price_per_day: 120000,
          release_year: 2021,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [{ url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 2
        },
        {
          id: 4,
          name: "Porsche 911 Carrera S",
          brand: "Porsche",
          model: "911",
          price_per_day: 200000,
          release_year: 2023,
          transmission: "Робот",
          fuel_type: "Бензин",
          city: "Шымкент",
          images: [{ url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 2
        },
        {
          id: 5,
          name: "Tesla Model S Plaid",
          brand: "Tesla",
          model: "Model S",
          price_per_day: 130000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Электро",
          city: "Алматы",
          images: [{ url: "https://images.unsplash.com/photo-1617788130012-02ba7174adc6?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 3
        },
        {
          id: 6,
          name: "Lexus LX 570",
          brand: "Lexus",
          model: "LX 570",
          price_per_day: 75000,
          release_year: 2020,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Астана",
          images: [{ url: "https://images.unsplash.com/photo-1621993202323-f438eec63e99?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 1
        },
        {
          id: 7,
          name: "Range Rover Vogue",
          brand: "Land Rover",
          model: "Vogue",
          price_per_day: 95000,
          release_year: 2021,
          transmission: "Автомат",
          fuel_type: "Дизель",
          city: "Алматы",
          images: [{ url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 1
        },
        {
          id: 8,
          name: "Audi RS7 Sportback",
          brand: "Audi",
          model: "RS7",
          price_per_day: 110000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [{ url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 2
        },
        {
          id: 9,
          name: "Hyundai Santa Fe",
          brand: "Hyundai",
          model: "Santa Fe",
          price_per_day: 45000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Караганда",
          images: [{ url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" }],
          category_id: 1
        }
      ];
    },
  });
}

export function useCar(id: number) {
  return useQuery<CarResponse>({
    queryKey: ['car', id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      try {
        const res = await apiClient.get(`/cars/${id}`) as any;
        const data = res && res.id ? res : (res?.data || null);
        if (data) return data;
      } catch (err) {
        console.error('Failed to fetch car detail:', err);
      }

      // Fallback mock data
      const mockCars = [
        {
          id: 1,
          name: "Mercedes-Benz G-Class",
          brand: "Mercedes",
          model: "G63 AMG",
          price_per_day: 150000,
          release_year: 2023,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [
            { url: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Mercedes-Benz G-Class 2023 года — вершина внедорожной мощи и роскоши. Этот легендарный автомобиль сочетает в себе вневременной дизайн и современные инновации.",
          condition: "Идеальное",
          color: "Черный",
          steering: "Слева",
          mileage: "5 000",
          body_type: "Внедорожник",
          customs_cleared: "Да",
          additional_info: "Налог уплачен, Техосмотр пройден, Вложений не требует",
          category_id: 1
        },
        {
          id: 2,
          name: "Toyota Land Cruiser 300",
          brand: "Toyota",
          model: "LC300",
          price_per_day: 85000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Дизель",
          city: "Астана",
          images: [
            { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1594563703937-fdc640497dcd?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Toyota Land Cruiser 300 надежный и проходимый внедорожник, идеально подходящий для любых дорожных условий Казахстана.",
          condition: "Отличное",
          color: "Белый",
          steering: "Слева",
          mileage: "12 000",
          body_type: "Внедорожник",
          customs_cleared: "Да",
          category_id: 1
        },
        {
          id: 3,
          name: "BMW M5 Competition",
          brand: "BMW",
          model: "M5",
          price_per_day: 120000,
          release_year: 2021,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [
            { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "BMW M5 Competition - это сочетание бизнес-седана и суперкара. Невероятная динамика и управляемость.",
          condition: "Идеальное",
          color: "Серый",
          steering: "Слева",
          mileage: "15 000",
          body_type: "Седан",
          customs_cleared: "Да",
          category_id: 2
        },
        {
          id: 4,
          name: "Porsche 911 Carrera S",
          brand: "Porsche",
          model: "911",
          price_per_day: 200000,
          release_year: 2023,
          transmission: "Робот",
          fuel_type: "Бензин",
          city: "Шымкент",
          images: [
            { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Эталон спортивного автомобиля. Porsche 911 дарит эмоции, которые невозможно забыть.",
          condition: "Идеальное",
          color: "Черный",
          steering: "Слева",
          mileage: "1 500",
          body_type: "Купе",
          customs_cleared: "Да",
          category_id: 2
        },
        {
          id: 5,
          name: "Tesla Model S Plaid",
          brand: "Tesla",
          model: "Model S",
          price_per_day: 130000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Электро",
          city: "Алматы",
          images: [
            { url: "https://images.unsplash.com/photo-1617788130012-02ba7174adc6?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Самый быстрый серийный электромобиль. Будущее уже здесь.",
          condition: "Новое",
          color: "Белый",
          steering: "Слева",
          mileage: "3 200",
          body_type: "Седан",
          customs_cleared: "Да",
          category_id: 3
        },
        {
          id: 6,
          name: "Lexus LX 570",
          brand: "Lexus",
          model: "LX 570",
          price_per_day: 75000,
          release_year: 2020,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Астана",
          images: [
            { url: "https://images.unsplash.com/photo-1516515429572-11cfe793833b?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1621993202323-f438eec63e99?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Люксовый внедорожник, который не боится преград. Комфорт первого класса.",
          condition: "Хорошее",
          color: "Черный",
          steering: "Слева",
          mileage: "54 000",
          body_type: "Внедорожник",
          customs_cleared: "Да",
          category_id: 1
        },
        {
          id: 7,
          name: "Range Rover Vogue",
          brand: "Land Rover",
          model: "Vogue",
          price_per_day: 95000,
          release_year: 2021,
          transmission: "Автомат",
          fuel_type: "Дизель",
          city: "Алматы",
          images: [
            { url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1606148334072-d0c2e13fa4ee?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Британская классика роскоши. Идеален как для города, так и для дальних поездок.",
          condition: "Отличное",
          color: "Темно-зеленый",
          steering: "Слева",
          mileage: "28 000",
          body_type: "Внедорожник",
          customs_cleared: "Да",
          category_id: 1
        },
        {
          id: 8,
          name: "Audi RS7 Sportback",
          brand: "Audi",
          model: "RS7",
          price_per_day: 110000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Алматы",
          images: [
            { url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Агрессивный дизайн и впечатляющая мощь. Настоящий зверь на дороге.",
          condition: "Отличное",
          color: "Серый мат",
          steering: "Слева",
          mileage: "11 000",
          body_type: "Лифтбек",
          customs_cleared: "Да",
          category_id: 2
        },
        {
          id: 9,
          name: "Hyundai Santa Fe",
          brand: "Hyundai",
          model: "Santa Fe",
          price_per_day: 45000,
          release_year: 2022,
          transmission: "Автомат",
          fuel_type: "Бензин",
          city: "Караганда",
          images: [
            { url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop" },
            { url: "https://images.unsplash.com/photo-1631835323041-38ca7977a68e?q=80&w=2000&auto=format&fit=crop" }
          ],
          description: "Удобный и практичный кроссовер для всей семьи.",
          condition: "Хорошее",
          color: "Белый",
          steering: "Слева",
          mileage: "35 000",
          body_type: "Кроссовер",
          customs_cleared: "Да",
          category_id: 1
        }
      ];

      // Find by id or return the first one as default for demo
      return mockCars.find(c => c.id === id) || mockCars[0];
    },
    enabled: !!id,
  });
}

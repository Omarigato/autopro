"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Car,
    Truck,
    Construction,
    Wrench,
    Ship,
    Grid,
    Camera,
    ChevronLeft
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Step 1: Categories
const CATEGORIES = [
    { id: 1, name: "Legkovoe avto", label: "Легковое авто", icon: Car },
    { id: 2, name: "Gruzovoe avto", label: "Грузовое авто", icon: Truck },
    { id: 3, name: "Spectehnika", label: "Спецтехника", icon: Construction },
    { id: 4, name: "Oborudovanie", label: "Оборудование", icon: Wrench },
    { id: 5, name: "Vodny transport", label: "Водный транспорт", icon: Ship },
    { id: 6, name: "Uslugi", label: "Услуги", icon: Grid },
];

export default function AddAnnouncement() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        category: null,
        brand: "",
        model: "",
        color: "",
        volume: "",
        fuel: "",
        gearbox: "",
        mileage: "",
        description: "",
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Handlers
    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    const handleCategorySelect = (id: any) => {
        setFormData({ ...formData, category: id });
        handleNext();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newPhotos = [...photos];
            newPhotos[index] = file;
            setPhotos(newPhotos);

            const newPreviews = [...previews];
            newPreviews[index] = URL.createObjectURL(file);
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", `${formData.brand} ${formData.model}`);
            // Default mock IDs for now, should come from select inputs in real app
            data.append("marka_id", "1");
            data.append("model_id", "1");

            // Serialize details to description or send as separate fields if backend supports
            const description = `
        Цвет: ${formData.color}
        Объем: ${formData.volume}
        Топливо: ${formData.fuel}
        КПП: ${formData.gearbox}
        Пробег: ${formData.mileage}
      `;
            data.append("description", description);
            data.append("release_year", "2020");

            photos.forEach((photo) => {
                if (photo) data.append("photos", photo);
            });

            await apiClient.post("/cars", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Объявление успешно создано!");
            router.push("/");
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании объявления. Убедитесь, что вы авторизованы.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="p-4 border-b flex items-center bg-white sticky top-0 z-10">
                {step > 1 && (
                    <button onClick={handleBack} className="mr-4">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                )}
                <h1 className="text-xl font-bold flex-1 text-center pr-10">
                    {step === 1 && "Добавьте объявление"}
                    {step > 1 && "Новое объявление"}
                </h1>
            </header>

            <div className="p-6 pb-24 max-w-md mx-auto">
                <div className="text-sm text-gray-400 mb-6">Шаг {step}</div>

                {/* Step 1: Categories */}
                {step === 1 && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">Выберите тип объявления</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-primary hover:bg-blue-50 transition aspect-square"
                                >
                                    <cat.icon className="w-8 h-8 text-primary mb-2" />
                                    <span className="text-xs text-center font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Brand/Model */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mb-1 block">Категория</label>
                            <div className="p-3 border rounded-xl bg-gray-50 text-gray-700">
                                {CATEGORIES.find(c => c.id === formData.category)?.label || "Выбрано"}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-500 mb-1 block">Бренд авто</label>
                                <input
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    placeholder="Укажите бренд авто"
                                    className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 mb-1 block">Марка авто (Модель)</label>
                                <input
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="Укажите марку авто"
                                    className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 mb-1 block">Цвет авто</label>
                                <input
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    placeholder="Укажите цвет авто"
                                    className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-primary text-white py-3 rounded-xl font-semibold mt-8"
                        >
                            Продолжить
                        </button>
                    </div>
                )}

                {/* Step 3: Specs */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mb-1 block">Объем двигателя</label>
                            <input
                                name="volume"
                                value={formData.volume}
                                onChange={handleInputChange}
                                placeholder="Укажите объем"
                                className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mb-1 block">Вид топлива</label>
                            <input
                                name="fuel"
                                value={formData.fuel}
                                onChange={handleInputChange}
                                placeholder="Укажите вид топлива"
                                className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mb-1 block">КПП</label>
                            <input
                                name="gearbox"
                                value={formData.gearbox}
                                onChange={handleInputChange}
                                placeholder="Укажите КПП"
                                className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 mb-1 block">Пробег</label>
                            <input
                                name="mileage"
                                value={formData.mileage}
                                onChange={handleInputChange}
                                placeholder="Укажите пробег"
                                className="w-full p-3 border rounded-xl focus:border-primary outline-none"
                            />
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-primary text-white py-3 rounded-xl font-semibold mt-8"
                        >
                            Продолжить
                        </button>
                    </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
                    <div className="space-y-6">
                        {[0, 1, 2].map((idx) => (
                            <div key={idx} className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 block">
                                    {idx === 0 ? "Фото авто передняя часть" : idx === 1 ? "Фото авто задняя часть" : "Фото авто боковая часть"}
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center relative bg-gray-50 hover:bg-gray-100 transition overflow-hidden">
                                    {previews[idx] ? (
                                        <img src={previews[idx]} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera className="w-8 h-8 text-primary mb-2 opacity-50" />
                                            <div className="text-blue-500 text-3xl font-light absolute">+</div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, idx)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-semibold mt-8 flex justify-center items-center"
                        >
                            {loading ? "Загрузка..." : "Продолжить"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
	_id,
	title: existingTitle,
	description: existingDescription,
	price: existingPrice,
	images: existingimages,
	category: existingCategory,
	properties: existingProperties,
}) {
	const [title, setTitle] = useState(existingTitle || "");
	const [description, setDescription] = useState(existingDescription || "");
	const [price, setPrice] = useState(existingPrice || "");
	const [category, setCategory] = useState(existingCategory || "");
	const [productProperties, setProductProperties] = useState(
		existingProperties || {}
	);
	const [goToProducts, setGoToProducts] = useState(false);
	const [images, setImages] = useState(existingimages || []);
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const router = useRouter();
	useEffect(() => {
		axios.get("/api/categories").then((result) => {
			setCategories(result.data);
		});
	}, []);

	const saveProduct = async (ev) => {
		ev.preventDefault();
		const data = {
			title,
			description,
			price,
			images,
			category,
			properties: productProperties,
		};
		if (_id) {
			//update
			await axios.put("/api/products", { ...data, _id });
		} else {
			//create
			await axios.post("/api/products", data);
		}
		setGoToProducts(true);
	};

	const uploadImages = async (ev) => {
		setLoading(true);
		const files = ev.target?.files;
		if (files?.length > 0) {
			const data = new FormData();
			for (const file of files) {
				data.append("file", file);
			}
			const res = await axios.post("/api/upload", data);
			setImages((oldImages) => {
				return [...oldImages, ...res.data.links];
			});
		}
		setLoading(false);
	};

	const updateImagesOrder = (images) => {
		setImages(images);
	};

	if (goToProducts) router.push("/products");

	const propertiesToFill = [];
	if (categories.length > 0 && category) {
		let categoryInfo = categories.find(({ _id }) => _id === category);

		propertiesToFill.push(...categoryInfo.properties);
		while (categoryInfo?.parent?._id) {
			const parentCategory = categories.find(
				({ _id }) => _id === categoryInfo?.parent?._id
			);
			propertiesToFill.push(...parentCategory.properties);
			categoryInfo = parentCategory;
		}
	}

	const setProductProp = (propName, value) => {
		setProductProperties((prev) => {
			const newProductProps = { ...prev };
			newProductProps[propName] = value;
			return newProductProps;
		});
	};

	const removePhoto = (indexToRemove) => {
		setImages((prev) => {
			return [...prev].filter((p, pIndex) => {
				return pIndex !== indexToRemove;
			});
		});
	};

	return (
		<form onSubmit={saveProduct}>
			<label>Назва товару</label>
			<input
				type="text"
				placeholder="назва товару"
				value={title}
				onChange={(ev) => setTitle(ev.target.value)}
				className="mb-2"></input>
			<label>Категорія</label>
			<select
				className="mb-2"
				value={category}
				onChange={(ev) => setCategory(ev.target.value)}>
				<option value={""}>Без Категорії</option>
				{categories.length > 0 &&
					categories.map((c, i) => (
						<option key={i} value={c._id}>
							{c.name}
						</option>
					))}
			</select>
			{propertiesToFill.length > 0 &&
				propertiesToFill.map((p, i) => (
					<div key={i} className="mb-2">
						<label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
						<select
							value={productProperties[p.name]}
							onChange={(ev) => setProductProp(p.name, ev.target.value)}>
							<option value={""}></option>
							{p.values.map((v, i) => (
								<option key={i} value={v}>
									{v}
								</option>
							))}
						</select>
					</div>
				))}
			<label>Фото</label>
			<div className="mb-2 flex flex-wrap gap-2">
				<ReactSortable
					list={images}
					setList={updateImagesOrder}
					className="flex flex-wrap gap-1">
					{!!images?.length &&
						images.map((link, index) => (
							<div
								key={link}
								className="h-24 bg-white p-4 shadow-sm border norder-gray-200 rounded-md relative">
								<img src={link} className="rounded-sm" />
								<div
									onClick={() => removePhoto(index)}
									className="absolute top-1 right-1 cursor-pointer">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="size-4">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										/>
									</svg>
								</div>
							</div>
						))}
				</ReactSortable>
				{loading && (
					<div className="h-24 p-1 flex items-center">
						<Spinner />
					</div>
				)}
				<label className="w-24 h-24 border flex items-center flex-col justify-center text-sm gap-1 text-primary rounded-md bg-white shadow-sm border-primary cursor-pointer">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
						/>
					</svg>
					<div>Додати фото</div>

					<input className="hidden" type="file" onChange={uploadImages} />
				</label>
			</div>
			<label>Опис</label>
			<textarea
				className="mb-2"
				placeholder="опис"
				value={description}
				onChange={(ev) => setDescription(ev.target.value)}
			/>
			<label>Ціна (в USD)</label>
			<input
				className="mb-2"
				type="number"
				placeholder="ціна"
				value={price}
				onChange={(ev) => setPrice(ev.target.value)}></input>
			<button type="submit" className="btn-primary">
				Зберегти
			</button>
		</form>
	);
}

//5:15:55

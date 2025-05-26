import Layout from "@/components/Layout";
import { Category } from "@/models/Category";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
	const [name, setName] = useState("");
	const [categories, setCategories] = useState([]);
	const [parentCategory, setParentCategory] = useState("");
	const [editedCategory, setEditedCategory] = useState(null);
	const [properties, setProperties] = useState([]);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = () => {
		axios.get("/api/categories").then((result) => {
			setCategories(result.data);
		});
	};

	const saveCategory = async (ev) => {
		ev.preventDefault();
		const data = {
			name,
			parentCategory,
			properties: properties.map((p) => ({
				name: p.name,
				values: p.values.split(","),
			})),
		};
		if (editedCategory) {
			data._id = editedCategory._id;
			await axios.put("/api/categories", data);
			setEditedCategory(null);
		} else {
			await axios.post("/api/categories", data);
		}
		setName("");
		setParentCategory("");
		setProperties([]);
		fetchCategories();
	};

	const editCategory = (category) => {
		setEditedCategory(category);
		setName(category.name);
		setParentCategory(category.parent?._id);
		setProperties(
			category.properties.map(({ name, values }) => ({
				name,
				values: values.join(","),
			}))
		);
	};

	const deleteCategory = (category) => {
		swal
			.fire({
				title: "Ви впевнені?",
				text: `Ви дійсно хочете видалити ${category.name}?`,
				showCancelButton: true,
				cancelButtonText: "Відмінити",
				confirmButtonText: "Так, Видалити!",
				confirmButtonColor: "#d55",
				reverseButtons: true,
			})
			.then(async (result) => {
				if (result.isConfirmed) {
					const { _id } = category;
					await axios.delete("/api/categories?_id=" + _id);
					fetchCategories();
				}
			});
	};

	const addProperty = () => {
		setProperties((prev) => {
			return [...prev, { name: "", values: "" }];
		});
	};

	function handlePropertyNameChange(index, property, newName) {
		setProperties((prev) => {
			const properties = [...prev];
			properties[index].name = newName;
			return properties;
		});
	}
	function handlePropertyValuesChange(index, property, newValues) {
		setProperties((prev) => {
			const properties = [...prev];
			properties[index].values = newValues;
			return properties;
		});
	}

	const removeProperty = (indexToRemove) => {
		setProperties((prev) => {
			return [...prev].filter((p, pIndex) => {
				return pIndex !== indexToRemove;
			});
		});
	};

	return (
		<Layout>
			<h1>Категорії</h1>
			<label>
				{editedCategory
					? `Редагувати категорію ${editedCategory.name}`
					: "Назва нової категорії"}
			</label>
			<form onSubmit={saveCategory}>
				<div className="flex gap-1 mb-2">
					<input
						className="mb-0"
						type="text"
						placeholder="Назва категорії"
						value={name}
						onChange={(ev) => setName(ev.target.value)}
					/>
					<select
						value={parentCategory}
						onChange={(ev) => setParentCategory(ev.target.value)}>
						<option value={undefined}>Немає батьківської категорії</option>
						{categories.length > 0 &&
							categories.map((category) => (
								<option key={category._id} value={category._id}>
									{category.name}
								</option>
							))}
					</select>
				</div>
				<div className="mb-2">
					<label className="block">Властивості</label>
					<button
						type="button"
						onClick={addProperty}
						className="btn-default text-sm">
						Додати нову властивість
					</button>
					{properties.length > 0 &&
						properties.map((property, index) => (
							<div className="flex gap-1 mt-2" key={index}>
								<input
									type="text"
									placeholder="назва властивості (наприклад: колір)"
									value={property.name}
									onChange={(ev) =>
										handlePropertyNameChange(index, property, ev.target.value)
									}
								/>
								<input
									type="text"
									placeholder="значення, через кому (наприклад: червоний,синій)"
									value={property.values}
									onChange={(ev) =>
										handlePropertyValuesChange(index, property, ev.target.value)
									}
								/>
								<button
									onClick={() => removeProperty(index)}
									type="button"
									className="btn-default">
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
											d="M6 18 18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						))}
				</div>
				<div className="flex gap-1">
					{editedCategory && (
						<button
							className="btn-default"
							type="button"
							onClick={() => {
								setEditedCategory(null);
								setName("");
								setParentCategory("");
								setProperties([]);
							}}>
							Відмінити
						</button>
					)}
					<button type="submit" className="btn-primary py-1">
						Зберегти
					</button>
				</div>
			</form>
			{!editedCategory && (
				<table className="basic mt-4">
					<thead>
						<tr>
							<td>Назва категорії</td>
							<td>Батьківська категорія</td>
							<td></td>
						</tr>
					</thead>
					<tbody>
						{categories.length > 0 &&
							categories.map((category) => (
								<tr key={category._id}>
									<td>{category.name}</td>
									<td>{category?.parent?.name}</td>
									<td>
										<div className="flex gap-1">
											<button
												className="btn-default inline-flex items-center"
												onClick={() => editCategory(category)}>
												{" "}
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
														d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
													/>
												</svg>
												Редагувати
											</button>
											<button
												className="btn-red inline-flex items-center"
												onClick={() => deleteCategory(category)}>
												{" "}
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
														d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
													/>
												</svg>
												Видалити
											</button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			)}
		</Layout>
	);
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);

//4:50:55

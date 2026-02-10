import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  Search,
  ArrowDownCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for Add AND Edit
  const [editingProduct, setEditingProduct] = useState(null); // If not null, we are editing

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form States
  const [productForm, setProductForm] = useState({
    product_name: "",
    brand: "",
    type_or_dimension: "",
    initial_stock: "", // Only used for Create
  });

  const [restockData, setRestockData] = useState({
    quantity_tons: "",
    remarks: "",
  });

  const fetchInventory = async () => {
    try {
      const res = await api.get("/inventory/list");
      setProducts(res.data);
    } catch (error) {
      toast.error(
        "Failed to load inventory: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- OPEN ADD MODAL ---
  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      product_name: "",
      brand: "",
      type_or_dimension: "",
      initial_stock: "",
    });
    setIsModalOpen(true);
  };

  // --- OPEN EDIT MODAL ---
  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_name: product.product_name,
      brand: product.brand,
      type_or_dimension: product.type_or_dimension,
      initial_stock: "", // Irrelevant for edit
    });
    setIsModalOpen(true);
  };

  // --- HANDLE SUBMIT (CREATE OR UPDATE) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // UPDATE (Metadata only)
        await api.put(`/inventory/update/${editingProduct.id}`, productForm);
        toast.success("Product Details Updated!");
      } else {
        // CREATE (With Stock)
        await api.post("/inventory/add", productForm);
        toast.success("Product Added Successfully!");
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product");
    }
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? If this product has sales, delete will fail.",
      )
    )
      return;
    try {
      await api.delete(`/inventory/delete/${id}`);
      toast.success("Product Deleted");
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  // --- RESTOCK LOGIC ---
  const openRestockModal = (product) => {
    setSelectedProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      await api.post("/inventory/stock-in", {
        product_id: selectedProduct.id,
        quantity_tons: parseFloat(restockData.quantity_tons),
        remarks: restockData.remarks,
      });
      toast.success("Stock Updated!");
      setIsRestockModalOpen(false);
      setRestockData({ quantity_tons: "", remarks: "" });
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding stock");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <div className="p-8">Loading Inventory...</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm">
            Manage your products and stock levels
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-3 text-gray-900"
          size={20}
        />
        <input
          type="text"
          placeholder="Search products by name or brand..."
          className="w-full pl-10 pr-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 🔥 1. Added Scroll Wrapper */}
        <div className="overflow-x-auto">
          {/* 🔥 2. Added min-w-[800px] to force horizontal scrolling on mobile */}
          <table className="w-full text-left min-w-200">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {/* 🔥 3. Added whitespace-nowrap to all headers */}
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                  Product Name
                </th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                  Brand
                </th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                  Dimension
                </th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                  Current Stock
                </th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 group">
                  {/* 🔥 4. Added whitespace-nowrap to data cells */}
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                    {product.product_name}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {product.brand}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {product.type_or_dimension}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${product.current_stock_tons < 10 ? "text-red-600" : "text-green-600"}`}>
                        {product.current_stock_tons} Tons
                      </span>
                      {product.current_stock_tons < 10 && (
                        <AlertTriangle
                          size={16}
                          className="text-red-500"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4 flex items-center gap-2 whitespace-nowrap">
                    {/* Restock Button */}
                    <button
                      onClick={() => openRestockModal(product)}
                      title="Add Stock"
                      className="text-green-600 hover:bg-green-50 p-2 rounded transition">
                      <ArrowDownCircle size={18} />
                    </button>

                    {/* Edit Button (Metadata Only) */}
                    <button
                      onClick={() => openEditModal(product)}
                      title="Edit Name/Brand"
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition">
                      <Pencil size={18} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Delete Product"
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REUSABLE PRODUCT MODAL (Add & Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">
              {editingProduct ? "Edit Product Details" : "Add New Product"}
            </h2>
            <form
              onSubmit={handleProductSubmit}
              className="space-y-4">
              <input
                placeholder="Product Name (e.g. TMT Bar)"
                className="w-full border p-2 rounded text-gray-900"
                value={productForm.product_name}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    product_name: e.target.value,
                  })
                }
                required
              />
              <input
                placeholder="Brand (e.g. Jindal)"
                className="w-full border p-2 rounded text-gray-900"
                value={productForm.brand}
                onChange={(e) =>
                  setProductForm({ ...productForm, brand: e.target.value })
                }
                required
              />
              <input
                placeholder="Dimension (e.g. 12mm)"
                className="w-full border p-2 rounded text-gray-900"
                value={productForm.type_or_dimension}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    type_or_dimension: e.target.value,
                  })
                }
                required
              />

              {/* STOCK INPUT: Only show if creating new product */}
              {!editingProduct && (
                <input
                  type="number"
                  step="0.01"
                  placeholder="Initial Stock (Tons)"
                  className="w-full border p-2 rounded text-gray-900"
                  value={productForm.initial_stock}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      initial_stock: e.target.value,
                    })
                  }
                />
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded">
                  {editingProduct ? "Update Details" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RESTOCK MODAL (Same as before) --- */}
      {isRestockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">
              Restock {selectedProduct.product_name}
            </h2>
            <form
              onSubmit={handleRestock}
              className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Quantity to Add (Tons)
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border p-2 rounded mt-1 text-gray-900"
                  value={restockData.quantity_tons}
                  onChange={(e) =>
                    setRestockData({
                      ...restockData,
                      quantity_tons: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Remarks (Source/Truck No)
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded mt-1 text-gray-900"
                  value={restockData.remarks}
                  onChange={(e) =>
                    setRestockData({ ...restockData, remarks: e.target.value })
                  }
                  placeholder="e.g. Truck UK07-1234"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-gray-900">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded">
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

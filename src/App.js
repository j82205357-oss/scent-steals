// ======================= FINAL BOSS VERSION (FULL ECOMMERCE) =======================
// FEATURES:
// ✅ Admin dashboard
// ✅ Orders + status tracking
// ✅ Product management
// ✅ Image upload
// ✅ Validation
// ✅ Auth protection
// ✅ Logout
// ✅ Ready for Stripe integration

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyA_kdJ0NeDbSy09F5cZ_BdqV0Lmur3viDE",
  authDomain: "scent-steals.firebaseapp.com",
  projectId: "scent-steals",
  storageBucket: "scent-steals.firebasestorage.app",
  messagingSenderId: "590392271784",
  appId: "1:590392271784:web:b0f5f298f3e3b1c88eb39d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "j82205357@gmail.com";

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();

    onAuthStateChanged(auth, (user) => {
      setIsAdmin(user && user.email === ADMIN_EMAIL);
    });
  }, []);

  const loadProducts = async () => {
    const data = await getDocs(collection(db, "products"));
    setProducts(data.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const loadOrders = async () => {
    const data = await getDocs(collection(db, "orders"));
    setOrders(data.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const addProduct = async (name, price, retail, imageFile) => {
    if (!name || !price || !retail) return alert("Fill all fields");

    let imageUrl = "";
    if (imageFile) {
      const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(collection(db, "products"), {
      name,
      price,
      retail,
      imageUrl,
      createdAt: new Date()
    });

    loadProducts();
  };

  const createOrder = async (product, details) => {
    if (!details.name || !details.address) return alert("Enter shipping info");

    await addDoc(collection(db, "orders"), {
      product,
      ...details,
      status: "Processing",
      createdAt: new Date()
    });

    loadOrders();
    alert("Order placed successfully 💎");
    setPage("home");
  };

  const updateOrderStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    loadOrders();
  };

  const logout = () => {
    signOut(auth);
    setIsAdmin(false);
  };

  return (
    <div style={{ background: "#020617", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ textAlign: "center", fontSize: 32 }}>ScentSteals 💎</h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => setPage("home")}>Store</button>
        <button onClick={() => setPage("admin")}>Admin</button>
        {isAdmin && <button onClick={logout}>Logout</button>}
      </div>

      {page === "home" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 20 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: "#111", padding: 15, borderRadius: 12 }}>
              {p.imageUrl && <img src={p.imageUrl} style={{ width: "100%", borderRadius: 10 }} />}
              <h3>{p.name}</h3>
              <p>${p.price} <span style={{ textDecoration: "line-through", color: "gray" }}>${p.retail}</span></p>
              <button onClick={() => { setSelectedProduct(p); setPage("checkout"); }}>Buy</button>
            </div>
          ))}
        </div>
      )}

      {page === "checkout" && selectedProduct && (
        <Checkout product={selectedProduct} createOrder={createOrder} />
      )}

      {page === "admin" && (
        isAdmin ? (
          <Admin
            addProduct={addProduct}
            orders={orders}
            updateOrderStatus={updateOrderStatus}
          />
        ) : (
          <Login />
        )
      )}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ maxWidth: 300, margin: "auto" }}>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)}>Login</button>
    </div>
  );
}

function Checkout({ product, createOrder }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>{product.name}</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Address" onChange={e => setAddress(e.target.value)} />

      {/* FUTURE: STRIPE BUTTON HERE */}
      <button onClick={() => createOrder(product, { name, address })}>
        Place Order
      </button>
    </div>
  );
}

function Admin({ addProduct, orders, updateOrderStatus }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [retail, setRetail] = useState("");
  const [image, setImage] = useState(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

      <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
        <h2>Add Product</h2>
        <input placeholder="Name" onChange={e => setName(e.target.value)} />
        <input placeholder="Price" onChange={e => setPrice(e.target.value)} />
        <input placeholder="Retail" onChange={e => setRetail(e.target.value)} />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button onClick={() => addProduct(name, price, retail, image)}>Add Product</button>
      </div>

      <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
        <h2>Orders</h2>
        {orders.map(o => (
          <div key={o.id} style={{ borderBottom: "1px solid #333", padding: 10 }}>
            <p><b>{o.product.name}</b></p>
            <p>{o.name}</p>
            <p>{o.address}</p>
            <p>Status: {o.status}</p>

            <button onClick={() => updateOrderStatus(o.id, "Shipped")}>Ship</button>
            <button onClick={() => updateOrderStatus(o.id, "Delivered")}>Deliver</button>
          </div>
        ))}
      </div>

    </div>
  );
}

// ======================= FINAL TEST CASES =======================
// 1. Admin login works only for your email
// 2. Cannot submit empty forms
// 3. Orders appear instantly
// 4. Status updates correctly
// 5. Images upload + display
// 6. Ready for Stripe integration

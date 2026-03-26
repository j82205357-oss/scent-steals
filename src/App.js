// ======================= INSANE V4 FIXED =======================

import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_kdJ0NeDbSy09F5cZ_BdqV0Lmur3viDE",
  authDomain: "scent-steals.firebaseapp.com",
  projectId: "scent-steals",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "j82205357@gmail.com";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadProducts();
    onAuthStateChanged(auth, (user) => {
      setIsAdmin(user && user.email === ADMIN_EMAIL);
    });
  }, []);

  const loadProducts = async () => {
    const data = await getDocs(collection(db, "products"));
    setProducts(data.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setCartOpen(true);
  };

  const checkout = async (details) => {
    if (!details.name || !details.address || !details.payment) {
      return alert("Fill all checkout fields");
    }

    await addDoc(collection(db, "orders"), {
      items: cart,
      ...details,
      createdAt: new Date()
    });

    setCart([]);
    setCartOpen(false);
    alert("Order placed 💎");
  };

  return (
    <div style={styles.page}>

      {/* NAV */}
      <div style={styles.navbar}>
        <h2>ScentSteals</h2>
        <div>
          <span onClick={() => setPage("home")} style={styles.link}>Store</span>
          <span onClick={() => setCartOpen(true)} style={styles.link}>Cart ({cart.length})</span>
          <span onClick={() => setPage("admin")} style={styles.link}>Admin</span>
          {isAdmin && <span onClick={() => signOut(auth)} style={styles.link}>Logout</span>}
        </div>
      </div>

      {/* STORE */}
      {page === "home" && (
        <>
          <div style={styles.hero}><h1>Luxury Redefined</h1></div>

          {/* WHY CHOOSE US */}
          <div style={styles.whySection}>
            <h2 style={styles.whyTitle}>Why Choose Us</h2>
            <div style={styles.divider}></div>

            <div style={styles.whyGrid}>
              <div style={styles.whyCard}>
                <h3>Premium Quality</h3>
                <p>Curated fragrances with long-lasting performance.</p>
              </div>
              <div style={styles.whyCard}>
                <h3>Fair Pricing</h3>
                <p>Luxury scents without insane markups.</p>
              </div>
              <div style={styles.whyCard}>
                <h3>Customer First</h3>
                <p>Fast service and smooth checkout.</p>
              </div>
            </div>
          </div>

          <div style={styles.grid}>
            {products.map(p => (
              <div key={p.id} style={styles.card}>
                <div style={styles.productImage}>
                  {p.image && <img src={p.image} style={styles.img} />}
                </div>

                <h3>{p.name}</h3>
                <p>${p.price}</p>

                <button style={styles.btn} onClick={() => addToCart(p)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </>
      )}

      {page === "admin" && (isAdmin ? <Admin loadProducts={loadProducts} products={products} /> : <Login />)}

      {cartOpen && <Checkout checkout={checkout} close={() => setCartOpen(false)} />}

    </div>
  );
}

// ================= CHECKOUT =================
function Checkout({ checkout, close }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("");

  return (
    <div style={styles.cartDrawer}>
      <h3>Checkout</h3>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Address" onChange={e => setAddress(e.target.value)} />
      <input placeholder="Payment" onChange={e => setPayment(e.target.value)} />
      <button onClick={() => checkout({ name, address, payment })}>Pay</button>
      <button onClick={close}>Close</button>
    </div>
  );
}

// ================= ADMIN =================
function Admin({ loadProducts, products }) {
  const [tab, setTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getDocs(collection(db, "orders"));
    setOrders(data.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addProduct = async () => {
    if (!name || !price) return alert("Fill all fields");
    await addDoc(collection(db, "products"), { name, price: Number(price), image });
    setName("");
    setPrice("");
    setImage("");
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  return (
    <div style={styles.adminWrapper}>
      <h2 style={styles.adminTitle}>Admin Dashboard 🔥</h2>

      {/* TABS */}
      <div style={styles.adminTabs}>
        <button onClick={() => setTab("products")} style={tab === "products" ? styles.activeTab : styles.tab}>Products</button>
        <button onClick={() => setTab("orders")} style={tab === "orders" ? styles.activeTab : styles.tab}>Orders</button>
      </div>

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div style={styles.adminSection}>
          <h3>Add Product</h3>

          <input placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} />
          <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={styles.input} />

          <div style={styles.dropZone} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            Drag & Drop Image
          </div>

          <button style={styles.primaryBtn} onClick={addProduct}>Add Product</button>

          <h3 style={{ marginTop: 40 }}>Your Products</h3>
          {products.map(p => (
            <div key={p.id} style={styles.adminItem}>
              <span>{p.name} - ${p.price}</span>
              <button onClick={() => deleteProduct(p.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div style={styles.adminSection}>
          <h3>Orders</h3>
          {orders.length === 0 && <p>No orders yet</p>}

          {orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <strong>{order.name}</strong>
              <p>{order.address}</p>
              <p>Payment: {order.payment}</p>

              {order.items?.map((item, i) => (
                <div key={i}>{item.name} - ${item.price}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= STYLES =================
const styles = {
  page: { fontFamily: "Arial", background: "#fff", minHeight: "100vh" },
  navbar: { display: "flex", justifyContent: "space-between", padding: 20, borderBottom: "1px solid #eee" },
  link: { marginLeft: 20, cursor: "pointer" },

  hero: { padding: 80, textAlign: "center", fontSize: 28 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 60,
    padding: "60px 120px",
    alignItems: "start"
  },
  card: {
    textAlign: "center",
    transition: "all 0.4s ease",
    cursor: "pointer",
    maxWidth: 260,
    margin: "0 auto"
  },
  productImage: {
    width: "100%",
    aspectRatio: "1/1",
    background: "#f3f3f3",
    marginBottom: 20,
    overflow: "hidden"
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },

  btn: { padding: 10, marginTop: 10, cursor: "pointer" },

  cartDrawer: { position: "fixed", right: 0, top: 0, width: 320, height: "100%", background: "white", padding: 20, boxShadow: "-5px 0 15px rgba(0,0,0,0.1)" },

  adminWrapper: { padding: 40 },
  adminTitle: { marginBottom: 20 },
  adminTabs: { display: "flex", gap: 10 },
  tab: { padding: 10, border: "1px solid #ccc" },
  activeTab: { padding: 10, background: "black", color: "white" },

  adminSection: { marginTop: 20 },
  adminItem: { display: "flex", justifyContent: "space-between", marginTop: 10 },

  orderCard: { border: "1px solid #eee", padding: 10, marginTop: 10 },

  input: { display: "block", marginBottom: 10, padding: 10, width: "100%" },

  dropZone: { border: "2px dashed #ccc", padding: 20, marginBottom: 10, textAlign: "center" },

  primaryBtn: { padding: 12, background: "black", color: "white", border: "none" },

  whySection: { padding: 60, textAlign: "center" },
  whyTitle: { fontSize: 28 },
  divider: { width: 60, height: 2, background: "black", margin: "20px auto" },
  whyGrid: { display: "flex", justifyContent: "center", gap: 30 },
  whyCard: { maxWidth: 200 }
};

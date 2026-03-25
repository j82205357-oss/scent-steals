// ======================= ULTRA FINAL BOSS (FIXED + LUXURY UI) =======================

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
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
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const addProduct = async (name, price, retail, imageFile) => {
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
      imageUrl
    });

    loadProducts();
  };

  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <div style={styles.hero}>
        <h1 style={styles.title}>ScentSteals 💎</h1>
        <p style={styles.subtitle}>Luxury fragrances for less</p>

        <div style={styles.nav}>
          <button style={styles.navBtn} onClick={() => setPage("home")}>Store</button>
          <button style={styles.navBtn} onClick={() => setPage("admin")}>Admin</button>
          {isAdmin && <button style={styles.navBtn} onClick={() => signOut(auth)}>Logout</button>}
        </div>
      </div>

      {/* STORE */}
      {page === "home" && (
        <div style={styles.grid}>
          {products.length === 0 && (
            <div style={styles.empty}>
              <h2>No products yet 💀</h2>
              <p>Go to Admin → Add your first product</p>
            </div>
          )}

          {products.map(p => (
            <div key={p.id} style={styles.card}>
              {p.imageUrl && <img src={p.imageUrl} style={styles.img} />}
              <h3>{p.name}</h3>
              <p>
                ${p.price} <span style={styles.retail}>${p.retail}</span>
              </p>
              <button style={styles.buyBtn} onClick={() => { setSelectedProduct(p); setPage("checkout"); }}>
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CHECKOUT */}
      {page === "checkout" && selectedProduct && (
        <div style={styles.center}>
          <h2>{selectedProduct.name}</h2>
          <button style={styles.buyBtn}>Stripe Checkout Coming 💳</button>
        </div>
      )}

      {/* ADMIN */}
      {page === "admin" && (
        isAdmin ? (
          <Admin addProduct={addProduct} />
        ) : (
          <Login />
        )
      )}
    </div>
  );
}

function Admin({ addProduct }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [retail, setRetail] = useState("");
  const [image, setImage] = useState(null);

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Add Product</h2>
        <input placeholder="Name" onChange={e => setName(e.target.value)} />
        <input placeholder="Price" onChange={e => setPrice(e.target.value)} />
        <input placeholder="Retail" onChange={e => setRetail(e.target.value)} />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button style={styles.buyBtn} onClick={() => addProduct(name, price, retail, image)}>Add Product</button>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <h2>Admin Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={styles.buyBtn} onClick={() => signInWithEmailAndPassword(auth, email, password)}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#020617", color: "white", minHeight: "100vh" },

  hero: {
    textAlign: "center",
    padding: "60px 20px",
    borderBottom: "1px solid #222"
  },

  title: { fontSize: "42px", fontWeight: "bold" },
  subtitle: { color: "#aaa", marginBottom: 20 },

  nav: { display: "flex", justifyContent: "center", gap: 10 },
  navBtn: {
    padding: "8px 16px",
    background: "#111",
    color: "white",
    border: "1px solid #333",
    borderRadius: 8,
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: 20,
    padding: 20
  },

  card: {
    background: "#111",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 0 20px rgba(255,255,255,0.05)"
  },

  img: { width: "100%", borderRadius: 12, marginBottom: 10 },

  retail: { textDecoration: "line-through", color: "gray" },

  buyBtn: {
    marginTop: 10,
    padding: "10px",
    width: "100%",
    background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
    border: "none",
    borderRadius: 10,
    color: "white",
    cursor: "pointer"
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh"
  },

  empty: {
    textAlign: "center",
    gridColumn: "1/-1",
    color: "#888"
  }
};

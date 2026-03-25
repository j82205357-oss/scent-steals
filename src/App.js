// ======================= ULTRA FINAL BOSS (LUXURY MAX UPGRADE) =======================

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

      {/* STICKY NAV */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>ScentSteals</h2>
        <div style={styles.navLinks}>
          <span onClick={() => setPage("home")} style={styles.link}>Store</span>
          <span onClick={() => setPage("admin")} style={styles.link}>Admin</span>
          {isAdmin && <span onClick={() => signOut(auth)} style={styles.link}>Logout</span>}
        </div>
      </div>

      {/* HERO */}
      {page === "home" && (
        <div style={styles.hero}>
          <h1 style={styles.title}>Luxury Fragrance</h1>
          <p style={styles.subtitle}>Minimal. Elegant. Timeless.</p>
        </div>
      )}

      {/* STORE */}
      {page === "home" && (
        <div style={styles.grid}>
          {products.map(p => (
            <div
              key={p.id}
              style={styles.card}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {p.imageUrl && <img src={p.imageUrl} style={styles.img} />}
              <h3>{p.name}</h3>
              <p>${p.price} <span style={styles.retail}>${p.retail}</span></p>
              <button style={styles.btn} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                View Product
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT PAGE */}
      {page === "product" && selectedProduct && (
        <div style={styles.productPage}>
          <img src={selectedProduct.imageUrl} style={styles.productImg} />
          <div>
            <h2>{selectedProduct.name}</h2>
            <p style={styles.price}>${selectedProduct.price}</p>
            <button style={styles.btn} onClick={() => setPage("checkout")}>Buy Now</button>
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {page === "checkout" && (
        <div style={styles.center}>
          <button style={styles.btn}>Stripe Checkout 💳</button>
        </div>
      )}

      {/* ADMIN */}
      {page === "admin" && (
        isAdmin ? <Admin addProduct={addProduct} /> : <Login />
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
        <button style={styles.btn} onClick={() => addProduct(name, price, retail, image)}>Add</button>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "70vh"
    }}>
      <div style={{
        width: 380,
        padding: 30,
        borderRadius: 16,
        background: "linear-gradient(145deg, #0f172a, #020617)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <h2 style={{
          marginBottom: 20,
          fontSize: 22,
          letterSpacing: 1,
          textAlign: "center",
          color: "white"
        }}>
          Admin Login
        </h2>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid #1e293b",
            background: "#020617",
            color: "white"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #1e293b",
            background: "#020617",
            color: "white"
          }}
        />

        <button
          onClick={() => signInWithEmailAndPassword(auth, email, password)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s"
          }}
          onMouseOver={e => e.target.style.opacity = 0.8}
          onMouseOut={e => e.target.style.opacity = 1}
        >
          Login
        </button>
      </div>
    </div>
  );
}>
      <div style={styles.card}>
        <h2>Admin Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={styles.btn} onClick={() => signInWithEmailAndPassword(auth, email, password)}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f8f6f2", minHeight: "100vh" },

  navbar: {
    position: "sticky",
    top: 0,
    background: "white",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee",
    zIndex: 1000
  },

  logo: { fontWeight: "300", letterSpacing: "2px" },

  navLinks: { display: "flex", gap: 20 },

  link: {
    cursor: "pointer",
    fontSize: "13px",
    letterSpacing: "1px"
  },

  hero: {
    textAlign: "center",
    padding: "100px 20px"
  },

  title: { fontSize: "42px", fontWeight: "300" },

  subtitle: { color: "#777" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 40,
    padding: 60
  },

  card: {
    textAlign: "center",
    transition: "0.3s",
    cursor: "pointer"
  },

  img: { width: "100%", height: 320, objectFit: "cover" },

  retail: { textDecoration: "line-through", color: "gray" },

  btn: {
    marginTop: 10,
    padding: "10px",
    border: "1px solid black",
    background: "transparent",
    cursor: "pointer"
  },

  productPage: {
    display: "flex",
    gap: 60,
    padding: 60
  },

  productImg: { width: "400px" },

  price: { fontSize: "24px", margin: "10px 0" },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh"
  }
};

// INSANE ADMIN V6 (WHITE, FULL MANAGEMENT) + CHECKOUT

import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
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

  const addToCart = (p) => setCart(prev => [...prev, p]);

  const checkout = async (details) => {
    await addDoc(collection(db, "orders"), {
      items: cart,
      ...details,
      status: "Pending",
      createdAt: new Date()
    });
    setCart([]);
    alert("Order placed 💎");
    setPage("home");
  };

  return (
    <div style={styles.page}>

      <div style={styles.nav}>
        <h2>ScentSteals</h2>
        <div>
          <span onClick={() => setPage("home")} style={styles.link}>Store</span>
          <span onClick={() => setPage("cart")} style={styles.link}>Cart ({cart.length})</span>
          <span onClick={() => setPage("admin")} style={styles.link}>Admin</span>
          {isAdmin && <span onClick={() => signOut(auth)} style={styles.link}>Logout</span>}
        </div>
      </div>

      {page === "home" && (
        <div style={styles.grid}>
          {products.map(p => (
            <div key={p.id} style={styles.card}>
              {p.image && <img src={p.image} alt="" style={styles.img} />}
              <h3>{p.name}</h3>
              <p>${p.price}</p>
              <button style={styles.btn} onClick={() => addToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}

      {page === "cart" && <Cart cart={cart} checkout={checkout} />}

      {page === "admin" && (isAdmin ? <Admin /> : <Login />)}

    </div>
  );
}

// CHECKOUT
function Cart({ cart, checkout }) {
  const [form, setForm] = useState({ name:"", email:"", address:"", payment:"" });
  const total = cart.reduce((s,i)=>s+i.price,0);

  return (
    <div style={styles.checkoutWrap}>
      <div style={styles.checkoutGrid}>

        <div>
          <input style={styles.inputLight} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
          <input style={styles.inputLight} placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
          <input style={styles.inputLight} placeholder="Address" onChange={e=>setForm({...form,address:e.target.value})}/>
        </div>

        <div style={styles.orderSummary}>
          {cart.map((i,idx)=>(
            <div key={idx} style={styles.summaryItem}><span>{i.name}</span><span>${i.price}</span></div>
          ))}
          <div style={styles.total}>${total}</div>
          <button style={styles.placeOrderLight} onClick={()=>checkout(form)}>Place Order</button>
        </div>

      </div>
    </div>
  );
}

// 🔥 ADMIN V6
function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("orders");

  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [image,setImage]=useState("");

  useEffect(()=>{load();},[]);

  const load = async () => {
    const o = await getDocs(collection(db,"orders"));
    const p = await getDocs(collection(db,"products"));

    const ordersArr = o.docs.map(d=>({...d.data(),id:d.id}));
    ordersArr.sort((a,b)=> new Date(b.createdAt?.seconds ? b.createdAt.seconds*1000 : b.createdAt) - new Date(a.createdAt?.seconds ? a.createdAt.seconds*1000 : a.createdAt));

    setOrders(ordersArr);
    setProducts(p.docs.map(d=>({...d.data(),id:d.id})));
  };

  const addProduct = async () => {
    await addDoc(collection(db,"products"),{ name, price:Number(price), image });
    setName(""); setPrice(""); setImage("");
    load();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db,"products",id));
    load();
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db,"orders",id), { status });
    load();
  };

  const handleImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.adminWhite}>

      <h1>Admin Panel</h1>

      <div style={styles.tabsWhite}>
        <button onClick={()=>setTab("orders")} style={tab==="orders"?styles.activeWhite:styles.tabWhite}>Orders</button>
        <button onClick={()=>setTab("products")} style={tab==="products"?styles.activeWhite:styles.tabWhite}>Products</button>
      </div>

      {/* ORDERS */}
      {tab === "orders" && (
        <div>
          {orders.map(o => (
            <div key={o.id} style={styles.orderCard}>
              <b>{o.name}</b> — ${o.items?.reduce((s,i)=>s+i.price,0)}
              <div>{o.address}</div>
              <div>Status: {o.status}</div>

              <select onChange={(e)=>updateStatus(o.id,e.target.value)} value={o.status}>
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>

              {o.items?.map((i,idx)=> (
                <div key={idx}>• {i.name}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* PRODUCTS */}
      {tab === "products" && (
        <div>

          <div style={styles.addBox}>
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={styles.inputLight}/>
            <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} style={styles.inputLight}/>

            <div style={styles.dropZone} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleImage(e.dataTransfer.files[0]);}}>
              Drag Image
            </div>

            <input type="file" onChange={e=>handleImage(e.target.files[0])} />

            {image && <img src={image} style={styles.preview} />}

            <button onClick={addProduct}>Add Product</button>
          </div>

          {products.map(p=> (
            <div key={p.id} style={styles.productRow}>
              {p.image && <img src={p.image} style={styles.thumb} />}
              <span>{p.name}</span>
              <span>${p.price}</span>
              <button onClick={()=>deleteProduct(p.id)}>Delete</button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  return (
    <div style={styles.center}>
      <input onChange={e=>setEmail(e.target.value)} />
      <input type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={()=>signInWithEmailAndPassword(auth,email,password)}>Login</button>
    </div>
  );
}

const styles = {
  page:{background:"#fff",minHeight:"100vh"},
  nav:{display:"flex",justifyContent:"space-between",padding:20},
  link:{marginLeft:20,cursor:"pointer"},

  grid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40,padding:40},
  card:{border:"1px solid #eee",padding:20},
  img:{width:"100%",aspectRatio:"1 / 1",objectFit:"cover"},
  btn:{padding:10,width:"100%"},

  checkoutWrap:{maxWidth:900,margin:"80px auto",background:"#fff",padding:50,border:"1px solid #eee"},
  checkoutGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40},
  inputLight:{width:"100%",padding:12,border:"1px solid #ddd",marginBottom:10},
  orderSummary:{borderLeft:"1px solid #eee",paddingLeft:20},
  summaryItem:{display:"flex",justifyContent:"space-between"},
  total:{marginTop:10,fontWeight:"bold"},
  placeOrderLight:{marginTop:10,padding:12,width:"100%",background:"black",color:"white",border:"none"},

  center:{textAlign:"center",marginTop:50},

  adminWhite:{background:"#fff",padding:40},
  tabsWhite:{display:"flex",gap:10,marginBottom:20},
  tabWhite:{padding:10,border:"1px solid #ddd"},
  activeWhite:{padding:10,border:"2px solid black"},

  orderCard:{border:"1px solid #eee",padding:20,marginBottom:15},

  addBox:{border:"1px solid #eee",padding:20,marginBottom:30},
  dropZone:{border:"2px dashed #ccc",padding:30,textAlign:"center",marginBottom:10},
  preview:{width:120,height:120,objectFit:"cover"},

  productRow:{display:"flex",alignItems:"center",gap:15,borderBottom:"1px solid #eee",padding:10},
  thumb:{width:60,height:60,objectFit:"cover"}
};

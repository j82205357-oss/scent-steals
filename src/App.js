// INSANE ADMIN V7 + CART ANIMATION + ICON

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
  const [cartAnim, setCartAnim] = useState(false);

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

  const addToCart = (p) => {
    setCart(prev => [...prev, p]);
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 600);
  };

  const checkout = async (details) => {
    if (!details.address || !details.city || !details.state || !details.zip || !details.payment) {
      alert("Address, city, state, zip, and payment method are required");
      return;
    }

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
        <div style={{display:"flex",alignItems:"center"}}>
          <span onClick={() => setPage("home")} style={styles.link}>Store</span>

          <span onClick={() => setPage("admin")} style={styles.link}>Admin</span>

          {/* CART ICON */}
          <div
            onClick={() => setPage("cart")}
            style={cartAnim ? styles.cartIconActive : styles.cartIcon}
          >
            🛒 {cart.length}
          </div>

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

// CHECKOUT (unchanged)
function Cart({ cart, checkout }) {
  const [form, setForm] = useState({ name:"", email:"", address:"", city:"", state:"", zip:"", payment:"" });
  const total = cart.reduce((s,i)=>s+i.price,0);
  const paymentOptions = ["PayPal","CashApp","Apple Pay","Crypto"];

  return (
    <div style={styles.checkoutWrap}>
      <div style={styles.checkoutGrid}>

        <div>
          <input style={styles.inputLight} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
          <input style={styles.inputLight} placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
          <input style={styles.inputLight} placeholder="Address" onChange={e=>setForm({...form,address:e.target.value})}/>
          <input style={styles.inputLight} placeholder="City" onChange={e=>setForm({...form,city:e.target.value})}/>
          <input style={styles.inputLight} placeholder="State" onChange={e=>setForm({...form,state:e.target.value})}/>
          <input style={styles.inputLight} placeholder="ZIP" onChange={e=>setForm({...form,zip:e.target.value})}/>

          <div style={{marginTop:20}}>
            <div>Select Payment</div>
            <div style={styles.paymentGrid}>
              {paymentOptions.map(p => (
                <div key={p} onClick={()=>setForm({...form,payment:p})} style={form.payment===p ? styles.paymentActive : styles.paymentBox}>
                  {p}
                </div>
              ))}
            </div>
          </div>
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

// ================= ADMIN (FIXED + ORGANIZED) =================
function Admin(){
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [image,setImage]=useState("");

  useEffect(()=>{
    load();
  },[]);

  const load = async ()=>{
    const p = await getDocs(collection(db,"products"));
    setProducts(p.docs.map(d=>({...d.data(),id:d.id})));

    const o = await getDocs(collection(db,"orders"));
    setOrders(o.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const addProduct = async ()=>{
    if(!name || !price) return alert("Fill fields");
    await addDoc(collection(db,"products"),{name,price:Number(price),image});
    setName("");setPrice("");setImage("");
    load();
  };

  return (
    <div style={{padding:40}}>
      <h2>Admin Dashboard</h2>

      <h3>Add Product</h3>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={styles.inputLight}/>
      <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} style={styles.inputLight}/>
      <div
        onDragOver={(e)=>e.preventDefault()}
        onDrop={(e)=>{
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if(file){
            const reader = new FileReader();
            reader.onload = (ev)=>setImage(ev.target.result);
            reader.readAsDataURL(file);
          }
        }}
        style={{
          border:"2px dashed #ccc",
          padding:20,
          textAlign:"center",
          marginBottom:10,
          cursor:"pointer"
        }}
      >
        {image ? <img src={image} style={{width:100,height:100,objectFit:"cover"}}/> : "Drag & Drop Image Here"}
      </div>
      <button onClick={addProduct} style={styles.placeOrderLight}>Add Product</button>

      <h3 style={{marginTop:40}}>Products</h3>
      {products.map(p=>(
        <div key={p.id} style={{display:"flex",gap:20,alignItems:"center",marginBottom:10,border:"1px solid #eee",padding:10}}>
          {p.image && <img src={p.image} style={{width:60,height:60,objectFit:"cover"}}/>}
          <div>{p.name}</div>
          <div>${p.price}</div>
        </div>
      ))}

      <h3 style={{marginTop:40}}>Orders (Newest First)</h3>
      {orders.map(o=>(
        <div key={o.id} style={{border:"1px solid #eee",padding:15,marginBottom:10}}>
          <div><b>{o.name}</b> - {o.payment}</div>
          <div>{o.address}, {o.city}, {o.state} {o.zip}</div>
          {o.items?.map((i,idx)=>(<div key={idx}>{i.name} - ${i.price}</div>))}
        </div>
      ))}
    </div>
  );
}

function Login(){return <div style={{padding:40}}>Login</div>}

const styles = {
  page:{background:"#fff",minHeight:"100vh"},
  nav:{display:"flex",justifyContent:"space-between",padding:20,alignItems:"center"},
  link:{marginLeft:20,cursor:"pointer"},

  cartIcon:{
    marginLeft:20,
    cursor:"pointer",
    padding:"10px 14px",
    border:"1px solid #ddd",
    borderRadius:20,
    transition:"all 0.3s"
  },

  cartIconActive:{
    marginLeft:20,
    cursor:"pointer",
    padding:"10px 14px",
    border:"2px solid black",
    borderRadius:20,
    transform:"scale(1.2)",
    transition:"all 0.3s"
  },

  grid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40,padding:40},
  card:{border:"1px solid #eee",padding:20},
  img:{width:"100%",aspectRatio:"1 / 1",objectFit:"cover"},
  btn:{padding:10,width:"100%"},

  checkoutWrap:{maxWidth:900,margin:"80px auto",padding:50,border:"1px solid #eee"},
  checkoutGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40},
  inputLight:{width:"100%",padding:12,border:"1px solid #ddd",marginBottom:10},
  orderSummary:{borderLeft:"1px solid #eee",paddingLeft:20},
  summaryItem:{display:"flex",justifyContent:"space-between"},
  total:{marginTop:10,fontWeight:"bold"},
  placeOrderLight:{marginTop:10,padding:12,width:"100%",background:"black",color:"white"},

  paymentGrid:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10},
  paymentBox:{padding:12,border:"1px solid #ddd",textAlign:"center",cursor:"pointer"},
  paymentActive:{padding:12,border:"2px solid black",textAlign:"center"}
};

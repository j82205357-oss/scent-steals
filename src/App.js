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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);

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
    setDrawerOpen(true);
    setTimeout(() => setCartAnim(false), 600);
  };

  const checkout = async (details) => {
    if (!details.address || !details.city || !details.state || !details.zip || !details.payment) {
      alert("Address, city, state, zip, and payment method are required");
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        items: cart,
        name: details.name || "",
        email: details.email || "",
        address: details.address,
        city: details.city,
        state: details.state,
        zip: details.zip,
        payment: details.payment,
        status: "Pending",
        createdAt: Date.now() // 🔥 ensures proper saving + sorting
      });

      setCart([]);
      alert("Order placed 💎");
      setPage("home");

    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error placing order");
    }
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
            <div
              key={p.id}
              style={styles.card}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0) scale(1)"}
            >
              {p.image && <img src={p.image} alt="" style={styles.img} />}
              <h3>{p.name}</h3>
              <p>${p.price}</p>

              <button style={styles.btn} onClick={() => addToCart(p)}>Add to Cart</button>
              <button style={styles.btn} onClick={() => setQuickView(p)}>Quick View</button>
            </div>
          ))}
        </div>
      )}

      {page === "cart" && <Cart cart={cart} checkout={checkout} />}

      {/* CART DRAWER */}
      {drawerOpen && (
        <div style={styles.drawer}>
          <div style={styles.drawerHeader}>
            <b>Cart</b>
            <span onClick={()=>setDrawerOpen(false)} style={{cursor:"pointer"}}>✕</span>
          </div>
          {cart.map((i,idx)=>(
            <div key={idx} style={styles.drawerItem}>{i.name} - ${i.price}</div>
          ))}
          <button style={styles.placeOrderLight} onClick={()=>{setDrawerOpen(false);setPage("cart")}}>Checkout</button>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickView && (
        <div style={styles.modalOverlay} onClick={()=>setQuickView(null)}>
          <div style={styles.modal} onClick={e=>e.stopPropagation()}>
            {quickView.image && <img src={quickView.image} style={styles.img} />}
            <h2>{quickView.name}</h2>
            <p>${quickView.price}</p>
            <button style={styles.placeOrderLight} onClick={()=>addToCart(quickView)}>Add to Cart</button>
          </div>
        </div>
      )}
      {page === "admin" && (isAdmin ? <Admin /> : <Login />)}

    </div>
  );
}

// CHECKOUT (unchanged)
function Cart({ cart, checkout }) {
  const [form, setForm] = useState({ name:"", email:"", address:"", city:"", state:"", zip:"", payment:"" });
  const total = cart.reduce((s,i)=>s+i.price,0);
  const paymentOptions = ["PayPal","CashApp","Apple Pay","Crypto"];

  const isValid = form.address && form.city && form.state && form.zip && form.payment;

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
          <button
            style={{...styles.placeOrderLight, opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed"}}
            onClick={()=> isValid && checkout(form)}
          >
            Place Order
          </button>
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

    const list = o.docs.map(d=>{
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt || 0
      };
    });

    // 🔥 ALWAYS newest first (bulletproof)
    list.sort((a,b)=> Number(b.createdAt) - Number(a.createdAt));

    setOrders(list);
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

function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [shake,setShake]=useState(false);

  const login = async (e)=>{
    if(e) e.preventDefault();
    setError("");
    setLoading(true);
    try{
      await signInWithEmailAndPassword(auth,email,password);
    }catch(e){
      setError("Invalid email or password");
      setShake(true);
      setTimeout(()=>setShake(false),400);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"linear-gradient(180deg,#ffffff,#f3f3f3)"}}>
      <form
        onSubmit={login}
        style={{
          width:420,
          padding:60,
          border:"1px solid #eee",
          borderRadius:18,
          background:"rgba(255,255,255,0.7)",
          backdropFilter:"blur(12px)",
          boxShadow:"0 40px 120px rgba(0,0,0,0.1)",
          textAlign:"center",
          transform: shake ? "translateX(-6px)" : "translateX(0)",
          transition:"all 0.3s ease"
        }}
      >

        <h2 style={{marginBottom:30,fontWeight:200,letterSpacing:4}}>ADMIN ACCESS</h2>

        {/* EMAIL */}
        <div style={{position:"relative",marginBottom:25}}>
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{...styles.inputLuxury,border: email?"1px solid black":"1px solid #ddd"}}
          />
          <label style={email ? styles.labelActive : styles.label}>Email</label>
        </div>

        {/* PASSWORD */}
        <div style={{position:"relative",marginBottom:15}}>
          <input
            type={show?"text":"password"}
            value={password}
            onChange={e=>setPassword(e.target.value)}
            style={{...styles.inputLuxury,border: password?"1px solid black":"1px solid #ddd"}}
          />
          <label style={password ? styles.labelActive : styles.label}>Password</label>
          <span onClick={()=>setShow(!show)} style={styles.eye}>{show?"Hide":"Show"}</span>
        </div>

        {error && <div style={{color:"#d33",fontSize:13,marginBottom:15}}>{error}</div>}

        <button
          type="submit"
          style={{
            ...styles.placeOrderLight,
            background: loading ? "#333" : "black",
            transform: loading ? "scale(0.98)" : "scale(1)",
            transition:"all 0.2s"
          }}
        >
          {loading ? "Authenticating..." : "Enter Admin"}
        </button>

      </form>
    </div>
  );
}


const styles = {
  drawer:{
    position:"fixed",
    right:0,
    top:0,
    width:320,
    height:"100%",
    background:"#fff",
    boxShadow:"-10px 0 40px rgba(0,0,0,0.1)",
    padding:20,
    zIndex:20,
    animation:"slideIn 0.3s ease"
  },
  drawerHeader:{display:"flex",justifyContent:"space-between",marginBottom:20},
  drawerItem:{marginBottom:10},

  modalOverlay:{
    position:"fixed",
    top:0,left:0,right:0,bottom:0,
    background:"rgba(0,0,0,0.4)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:30
  },

  modal:{
    background:"#fff",
    padding:40,
    borderRadius:12,
    width:400,
    textAlign:"center",
    boxShadow:"0 20px 60px rgba(0,0,0,0.2)"
  },
  page:{
    background:"linear-gradient(180deg,#ffffff,#f5f5f5)",
    minHeight:"100vh",
    fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial",
    color:"#111"
  },

  nav:{
    display:"flex",
    justifyContent:"space-between",
    padding:"30px 60px",
    alignItems:"center",
    borderBottom:"1px solid #eee",
    background:"rgba(255,255,255,0.7)",
    backdropFilter:"blur(10px)",
    position:"sticky",
    top:0,
    zIndex:10
  },

  link:{
    marginLeft:30,
    cursor:"pointer",
    letterSpacing:"1px",
    fontSize:14,
    transition:"opacity 0.2s"
  },

  cartIcon:{
    marginLeft:25,
    cursor:"pointer",
    padding:"10px 16px",
    border:"1px solid #ddd",
    borderRadius:25,
    transition:"all 0.3s",
    fontSize:14
  },

  cartIconActive:{
    marginLeft:25,
    cursor:"pointer",
    padding:"10px 16px",
    border:"2px solid black",
    borderRadius:25,
    transform:"scale(1.15)",
    transition:"all 0.3s"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", // more products per row
    gap:30,
    padding:"60px 80px"
  },

  card:{
    border:"1px solid #eee",
    padding:25,
    background:"#fff",
    borderRadius:12,
    transition:"all 0.3s",
    cursor:"pointer",
    boxShadow:"0 10px 30px rgba(0,0,0,0.04)"
  },

  img:{
    width:"100%",
    aspectRatio:"1 / 1",
    objectFit:"cover",
    borderRadius:10,
    marginBottom:15
  },

  btn:{
    padding:12,
    width:"100%",
    border:"1px solid #ddd",
    background:"white",
    marginTop:10,
    transition:"all 0.2s",
    cursor:"pointer"
  },

  checkoutWrap:{
    maxWidth:1000,
    margin:"100px auto",
    padding:60,
    border:"1px solid #eee",
    borderRadius:16,
    background:"#fff",
    boxShadow:"0 20px 60px rgba(0,0,0,0.06)"
  },

  checkoutGrid:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr",
    gap:50
  },

  inputLight:{
    width:"100%",
    padding:14,
    border:"1px solid #ddd",
    marginBottom:14,
    borderRadius:8,
    fontSize:14
  },

  orderSummary:{
    borderLeft:"1px solid #eee",
    paddingLeft:30
  },

  summaryItem:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:10
  },

  total:{
    marginTop:20,
    fontWeight:"bold",
    fontSize:18
  },

  placeOrderLight:{
    marginTop:20,
    padding:14,
    width:"100%",
    background:"black",
    color:"white",
    border:"none",
    borderRadius:8,
    letterSpacing:"1px",
    cursor:"pointer"
  },

  paymentGrid:{
    display:"grid",
    gridTemplateColumns:"repeat(2,1fr)",
    gap:12,
    marginTop:10
  },

  paymentBox:{
    padding:14,
    border:"1px solid #ddd",
    textAlign:"center",
    cursor:"pointer",
    borderRadius:8,
    transition:"all 0.2s"
  },

  paymentActive:{
    padding:14,
    border:"2px solid black",
    textAlign:"center",
    borderRadius:8
  },

  /* LOGIN SHARED STYLES */
  inputLuxury:{
    width:"100%",
    padding:"14px 10px",
    border:"1px solid #ddd",
    outline:"none",
    background:"transparent"
  },

  label:{
    position:"absolute",
    left:10,
    top:12,
    fontSize:13,
    color:"#777",
    transition:"0.2s"
  },

  labelActive:{
    position:"absolute",
    left:10,
    top:-8,
    fontSize:11,
    background:"white",
    padding:"0 4px",
    color:"black"
  },

  eye:{
    position:"absolute",
    right:10,
    top:12,
    fontSize:12,
    cursor:"pointer"
  }
};


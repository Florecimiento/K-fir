/*******************************
   * Datos iniciales del pedido
   * (en tu app esto vendrá del carrito)
   *******************************/
  function getCartData() {
  const cart = JSON.parse(localStorage.getItem("checkout_cart")) || [];

  // Normalizar por si vienen con "quantity" o "qty"
  return cart.map(p => ({
    name: p.name,
    price: p.price,
    qty: p.quantity || p.qty
  }));
}

function getCartTotal() {
  const cart = getCartData();
  return cart.reduce((sum, p) => sum + (p.price * p.qty), 0);
}

const CART = getCartData();

console.log("✅ CARRITO RECIBIDO:", CART);
alert("✅ Carrito cargado en pagos:\n" + JSON.stringify(CART, null, 2));


  // recalcula totales
function calculateTotals() {
  const subtotal = CART.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 150 ? 0 : 25;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}

  // renderiza resumen
  function renderSummary() {

  const ul = document.getElementById("summaryList");
  if (!ul) return;

  ul.innerHTML = "";

  if (CART.length === 0) {
    ul.innerHTML = "<li>Carrito vacío</li>";
    return;
  }

  CART.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} x ${p.qty} — $${(p.price * p.qty).toFixed(2)} MXN`;
    ul.appendChild(li);
  });

  const totals = calculateTotals();

  document.getElementById("subtotal").textContent = `$${totals.subtotal.toFixed(2)} MXN`;
  document.getElementById("shipping").textContent = `$${totals.shipping.toFixed(2)} MXN`;
  document.getElementById("total").textContent = `$${totals.total.toFixed(2)} MXN`;
  document.getElementById("topTotal").textContent = `$${totals.total.toFixed(2)} MXN`;
}



  renderSummary();

  /********************************
   * Definición de métodos de pago
   * Cada método define:
   *  - id, title, desc, image (opcional)
   *  - renderForm(container, totals, onSubmit) -> genera UI específica
   *  - onProcess(formData, totals) -> maneja procesado (puede llamar al servidor)
   ********************************/
  const paymentMethods = [
    {
      id: "cod",
      title: "Efectivo al momento de recibir",
      desc: "Paga en efectivo cuando te entreguen el pedido.",
      image: "https://cdn-icons-png.flaticon.com/512/483/483361.png",
      renderForm: function(parent, totals, onConfirm){
        parent.innerHTML = `
          <p class="muted">Seleccionaste: <strong>${this.title}</strong></p>
          <label>Nombre del receptor</label>
          <input id="cod_name" type="text" placeholder="Ej: Marisol" />
          <label>Teléfono (para coordinar entrega)</label>
          <input id="cod_phone" type="tel" placeholder="2222222222" />
          <div class="notice">Recuerda preparar el monto exacto si puedes.</div>
          <button class="btn" id="cod_confirm">Confirmar pedido y pagar en entrega</button>
        `;
        parent.querySelector("#cod_confirm").addEventListener("click", ()=>{
          const data = {
            name: parent.querySelector("#cod_name").value.trim(),
            phone: parent.querySelector("#cod_phone").value.trim()
          };
          onConfirm(data);
        });
      },
      onProcess: async function(formData, totals){
        // Aquí podrías enviar al backend la orden con estado "pendiente pago - COD"
        return { ok:true, message:"Pedido registrado. Pagarás en la entrega." };
      }
    },

    {
      id: "oxxo",
      title: "Efectivo en OXXO (pago en tienda)",
      desc: "Genera tu comprobante con código de barras y llévalo a cualquier OXXO.",
      image: "https://cdn-icons-png.flaticon.com/512/825/825528.png",
      renderForm: function(parent, totals, onConfirm){
        parent.innerHTML = `
          <p class="muted">Total a pagar: <strong>$${totals.total.toFixed(2)} MXN</strong></p>
          <label>Nombre (titular del pago)</label>
          <input id="oxxo_name" type="text" placeholder="Nombre" />
          <label>Correo (para recibir comprobante)</label>
          <input id="oxxo_mail" type="text" placeholder="tu@correo.com" />
          <div style="margin-top:12px" class="muted">Al confirmar se generará un código de pago que podrás imprimir.</div>
          <button class="btn" id="oxxo_confirm">Generar comprobante OXXO</button>

          <div id="oxxo_result" style="margin-top:12px; display:none">
            <div class="barcode-wrap">
              <canvas id="barcodeCanvas" width="400" height="90"></canvas>
            </div>
            <div style="margin-top:8px; font-size:13px" class="muted">Código de referencia: <span id="oxxo_code" style="font-weight:700"></span></div>
            <button class="btn secondary" id="oxxo_print">Imprimir / Guardar</button>
          </div>
        `;
        parent.querySelector("#oxxo_confirm").addEventListener("click", async ()=>{
          const data = {
            name: parent.querySelector("#oxxo_name").value.trim(),
            email: parent.querySelector("#oxxo_mail").value.trim()
          };
          onConfirm(data);
        });
        parent.querySelector("#oxxo_print").addEventListener("click", ()=>{
          window.print();
        });
      },
      onProcess: async function(formData, totals){
        // Generamos un código (ej: hash simple + timestamp)
        const seed = `${formData.email||formData.name}-${totals.total}-${Date.now()}`;
        const code = simpleHashCode(seed);
        // Retornamos para que la UI genere barcode
        return { ok:true, code: code.toString().padStart(12,"0"), message:"Comprobante generado" };
      },
      postRender: function(result){
        // Dibuja código como barras en canvas (simple)
        const code = result.code || "000000000000";
        const canvas = document.getElementById("barcodeCanvas");
        const ctx = canvas.getContext("2d");
        // simple visual barcode: barras negras verticales basadas en digits
        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const digits = code.split("");
        const barWidth = Math.floor(w / (digits.length * 2));
        let x = 8;
        for(let d of digits){
          const v = parseInt(d,10) || 0;
          const barH = 20 + (v/9) * (h-40);
          ctx.fillStyle = "#000";
          ctx.fillRect(x, (h-barH)/2, barWidth, barH);
          x += barWidth*2;
        }
        document.getElementById("oxxo_code").textContent = code;
        document.getElementById("oxxo_result").style.display = "block";
      }
    },

    {
      id: "card",
      title: "Tarjeta (débito/crédito)",
      desc: "Aceptamos tarjetas Visa, MasterCard y Amex. Se procesará con pasarela segura.",
      image: "https://cdn-icons-png.flaticon.com/512/196/196561.png",
      renderForm: function(parent, totals, onConfirm){
        parent.innerHTML = `
          <p class="muted">Total: <strong>$${totals.total.toFixed(2)} MXN</strong></p>
          <label>Número de tarjeta</label>
          <input id="card_number" type="text" placeholder="1234 5678 9012 3456" maxlength="19" />
          <div class="row">
            <div class="col">
              <label>MM/AA</label>
              <input id="card_exp" type="text" placeholder="08/26" maxlength="5" />
            </div>
            <div class="col">
              <label>CVC</label>
              <input id="card_cvc" type="password" placeholder="123" maxlength="4" />
            </div>
          </div>
          <label>Nombre en la tarjeta</label>
          <input id="card_name" type="text" placeholder="NOMBRE APELLIDO" />
          <button class="btn" id="card_confirm">Pagar con tarjeta</button>
          <div class="notice">Se realizará una simulación de pago (integra tu pasarela real en onProcess).</div>
        `;
        parent.querySelector("#card_confirm").addEventListener("click", ()=>{
          const data = {
            number: parent.querySelector("#card_number").value.replace(/\s+/g,""),
            exp: parent.querySelector("#card_exp").value.trim(),
            cvc: parent.querySelector("#card_cvc").value.trim(),
            name: parent.querySelector("#card_name").value.trim()
          };
          onConfirm(data);
        });

        // auto-format card number
        parent.addEventListener("input", (e)=>{
          if(e.target && e.target.id === "card_number"){
            let v = e.target.value.replace(/\D/g,"").slice(0,16);
            e.target.value = v.replace(/(.{4})/g,"$1 ").trim();
          }
        });
      },
      onProcess: async function(formData, totals){
        // Validaciones básicas:
        if(!/^\d{13,16}$/.test(formData.number)) return { ok:false, message:"Número de tarjeta inválido" };
        if(!/^\d{2}\/\d{2}$/.test(formData.exp)) return { ok:false, message:"Fecha inválida" };
        if(!/^\d{3,4}$/.test(formData.cvc)) return { ok:false, message:"CVC inválido" };

        // Aquí integrar tu pasarela real. Simulamos éxito:
        return { ok:true, message:"Pago con tarjeta aprobado (simulado)" };
      }
    },

    {
      id: "paypal",
      title: "PayPal",
      desc: "Te redirigiremos a PayPal para completar el pago.",
      image: "https://cdn-icons-png.flaticon.com/512/196/196578.png",
      renderForm: function(parent, totals, onConfirm){
        parent.innerHTML = `
          <p class="muted">Serás redirigido a PayPal para pagar <strong>$${totals.total.toFixed(2)} MXN</strong>.</p>
          <button class="btn" id="paypal_go">Pagar con PayPal</button>
        `;
        parent.querySelector("#paypal_go").addEventListener("click", ()=>{
          onConfirm({});
        });
      },
      onProcess: async function(formData, totals){
        // redirección a pasarela real (placeholder)
        window.location.href = `https://www.paypal.com/checkoutnow?amount=${totals.total.toFixed(2)}`;
        return { ok:true };
      }
    },

    {
      id: "mercado",
      title: "Mercado Pago",
      desc: "Paga con Mercado Pago (tarjeta, efectivo o QR).",
      image: "https://cdn-icons-png.flaticon.com/512/825/825511.png",
      renderForm: function(parent, totals, onConfirm){
        parent.innerHTML = `
          <p class="muted">MercadoPago: opcionalmente podrás pagar con QR o tarjeta.</p>
          <button class="btn" id="mp_go">Ir a Mercado Pago</button>
        `;
        parent.querySelector("#mp_go").addEventListener("click", ()=>{
          onConfirm({});
        });
      },
      onProcess: async function(formData, totals){
        // placeholder
        window.location.href = `https://www.paypal.com/signin?locale.x=es_MX?amount=${totals.total.toFixed(2)}`;
        return { ok:true };
      }
    }
  ];

  /********************************
   * Render list of payment options
   ********************************/
  const optionsList = document.getElementById("optionsList");
  let selectedMethod = null;

  function renderOptions(){
    optionsList.innerHTML = "";
    paymentMethods.forEach(m=>{
      const el = document.createElement("div");
      el.className = "option-card";
      el.dataset.method = m.id;
      el.innerHTML = `
        <img src="${m.image||'https://i.postimg.cc/8P7Qf4kV/payment.png'}" alt="">
        <div class="option-info">
          <h3>${m.title}</h3>
          <p>${m.desc}</p>
        </div>
      `;
      el.addEventListener("click", ()=>selectMethod(m.id,true));
      optionsList.appendChild(el);
    });
  }
  renderOptions();

  /********************************
   * Seleccionar método
   ********************************/
  function clearSelectionUI(){
    document.querySelectorAll(".option-card").forEach(n=>n.classList.remove("selected"));
  }

  function selectMethod(id, scrollToForm=false){
    selectedMethod = paymentMethods.find(p=>p.id===id);
    clearSelectionUI();
    const card = document.querySelector(`.option-card[data-method="${id}"]`);
    if(card) card.classList.add("selected");
    // render form
    document.getElementById("formTitle").textContent = selectedMethod.title;
    const formArea = document.getElementById("formContent");
    const totals = calculateTotals();
    selectedMethod.renderForm(formArea, totals, async (formData)=>{
      // user pressed confirm in the form
      // show loader or disable button:
      await handleConfirm(selectedMethod, formData);
    });
    // If method has postRender for after process, we'll call later
    if(scrollToForm) formArea.scrollIntoView({ behavior:"smooth", block:"center" });
  }

  /********************************
   * Confirm & Process flow
   ********************************/
  async function handleConfirm(method, formData){
    const totals = calculateTotals();
    // small UI lock
    const confirmArea = document.getElementById("confirmArea");
    confirmArea.innerHTML = `<div class="muted">Procesando...</div>`;
    try {
      const result = await method.onProcess(formData, totals);
      if(!result.ok){
        confirmArea.innerHTML = `<div style="color:#b33">${result.message||'Error'}</div>`;
        return;
      }
      // if method provides code (oxxo) render post area
      if(method.postRender && result.code){
        // call postRender for UI drawing
        method.postRender(result);
      }
      // show success and optionally send to server
      confirmArea.innerHTML = `<div class="success">✅ ${result.message||'Operación completada'}</div>
        <button class="btn secondary" id="finishBtn" style="margin-left:6px" onclick="finalizarPago()">Finalizar</button>`;
      document.getElementById("finishBtn").addEventListener("click", ()=>{
        // aquí podrías limpiar carrito o redirigir
        window.alert("Gracias! Pedido confirmado. (Integrar flujo real con tu backend).");
      });

      // ejemplo: enviar al servidor detalles del pago (hook)
      await sendPaymentToServer({ method: method.id, details: result, totals });
    } catch(err){
      confirmArea.innerHTML = `<div style="color:#b33">Error procesando el pago.</div>`;
      console.error(err);
    }
  }

  /********************************
   * Simple hash para generar código
   ********************************/
  function simpleHashCode(str){
    let h=0;
    for(let i=0;i<str.length;i++){
      h = (h<<5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString().slice(0,12);
  }

  /********************************
   * Hook: enviar información al backend (reemplazar)
   ********************************/
  async function sendPaymentToServer(payload){
    // Ejemplo (coméntalo si no tienes backend):
    try{
      // Si no quieres hacer petición, coméntala
      /*
      const res = await fetch("http://localhost:3000/api/pagos", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("Server response:", data);
      */
      console.log("Enviando payload al backend (simulado):", payload);
    }catch(e){
      console.warn("No se pudo enviar al backend:", e);
    }
  }

  async function processPayment(formData){

  if (!selectedMethod) return;

  alert(
    "📦 DATOS DE ENVÍO AL PAGO:\n\n" +
    "Método: " + selectedMethod.title + "\n" +
    "Total: $" + totals.total.toFixed(2) + "\n" +
    "Productos:\n" +
    JSON.stringify(totals.items, null, 2)
  );

  const result = await selectedMethod.onProcess(formData, totals);

  if (result.ok) {
    alert(result.message || "✅ Pago procesado exitosamente");

    if (selectedMethod.postRender) {
      selectedMethod.postRender(result);
    }

    localStorage.removeItem("checkout_cart");

  } else {
    alert(result.message || "❌ Hubo un error");
  }
}

function finalizarPago() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("⚠️ Tu carrito ya está vacío.");
    return;
  }

  localStorage.removeItem("cart");

  alert("✅ Pago realizado con éxito.\nTu carrito ha sido vaciado.");

  window.location.href = "menuPrincipal.html"; // o a la que tú quieras
}

  // Selección por defecto
  selectMethod(paymentMethods[0].id);
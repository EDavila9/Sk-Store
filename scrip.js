const API_URL = "https://script.google.com/macros/s/AKfycby8FyZR-1u-XRMqNbDqtYHCHEPFzbD4VY57ht8RBEFWLFURBV0IQgn-nF1Vi5H1-BSyFg/exec";
const ADMIN_PASS = "Saylingprenda"; // cambia esto

function login() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASS) {
    document.getElementById("login").style.display = "none";
    document.getElementById("main").style.display = "block";
    cargarDatos();
  } else {
    alert("Contraseña incorrecta");
  }
}

async function agregarPrenda() {
  const dueno = duenoEl.value.trim();
  const correo = correoEl.value.trim();
  const prenda = prendaEl.value.trim();
  const codigo = codigoEl.value.trim();
  const precio = precioEl.value.trim();
  const foto = fotoEl.files[0];

  if (!dueno || !correo || !prenda || !codigo || !precio) {
    alert("Completa todos los campos");
    return;
  }

  let fotoURL = "";
  if (foto) {
    fotoURL = await new Promise(r => {
      const reader = new FileReader();
      reader.onload = e => r(e.target.result);
      reader.readAsDataURL(foto);
    });
  }

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "add", dueno, correo, prenda, codigo, precio, foto: fotoURL })
  });

  alert("Prenda agregada correctamente");
  cargarDatos();
}

async function cargarDatos() {
  const res = await fetch(API_URL);
  const data = await res.json();
  const cont = document.getElementById("inventario");
  cont.innerHTML = "";

  const grupos = {};
  data.forEach(row => {
    const [id, dueno, correo, prenda, codigo, precio, foto, vendido] = row;
    if (!grupos[dueno]) grupos[dueno] = [];
    grupos[dueno].push({ prenda, codigo, precio, foto, vendido });
  });

  for (const dueno in grupos) {
    const div = document.createElement("div");
    div.className = "grupo";
    div.innerHTML = `<h2>${dueno}</h2>`;
    grupos[dueno].forEach(item => {
      div.innerHTML += `
        <div class="item ${item.vendido == 'SI' ? 'vendido' : ''}">
          ${item.foto ? `<img src="${item.foto}" alt="">` : ""}
          <div>
            <b>${item.prenda}</b><br>
            Código: ${item.codigo}<br>
            Precio: C$${item.precio}<br>
            <button onclick="marcarVendida('${item.codigo}')">Marcar vendida</button>
          </div>
        </div>`;
    });
    cont.appendChild(div);
  }
}

async function marcarVendida(codigo) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "sell", codigo })
  });
  alert("Notificación enviada al dueño");
  cargarDatos();
}

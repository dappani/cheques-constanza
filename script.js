
let registros=JSON.parse(localStorage.getItem('chequesRegistrosResponsive')||'[]');
let editando=null;
const clienteInput=document.getElementById('cliente');
const cedulaInput=document.getElementById('cedula');
const btnAgregar=document.getElementById('btnAgregar');
function guardar(){localStorage.setItem('chequesRegistrosResponsive',JSON.stringify(registros))}
function normalizar(t){return(t||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function escapeHTML(t){return String(t||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function renderizar(){
 const tbody=document.getElementById('tabla'); const buscar=normalizar(document.getElementById('buscar').value); tbody.innerHTML='';
 registros.map((item,index)=>({...item,originalIndex:index})).filter(item=>!buscar||normalizar(item.cliente).includes(buscar)||normalizar(item.cedula).includes(buscar)).forEach((item,visibleIndex)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${visibleIndex+1}</td><td>${escapeHTML(item.cliente)}</td><td>${escapeHTML(item.cedula||'')}</td><td class="no-print"><div class="action-buttons"><button class="edit" onclick="editar(${item.originalIndex})" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button><button class="delete" onclick="eliminar(${item.originalIndex})" title="Eliminar"><i class="fa-solid fa-trash"></i></button></div></td>`;
  tbody.appendChild(tr);
 });
}
function agregar(){
 const cliente=clienteInput.value.trim().toUpperCase(); const cedula=cedulaInput.value.trim();
 if(!cliente){alert('Escribe el nombre del cliente.');clienteInput.focus();return}
 if(editando!==null){registros[editando]={cliente,cedula}; editando=null; btnAgregar.textContent='Agregar'} else {registros.push({cliente,cedula})}
 guardar(); renderizar(); limpiarFormulario();
}
function editar(index){const item=registros[index];clienteInput.value=item.cliente;cedulaInput.value=item.cedula;editando=index;btnAgregar.textContent='Guardar cambios';clienteInput.focus()}
function eliminar(index){registros.splice(index,1);guardar();renderizar()}
function limpiarFormulario(){clienteInput.value='';cedulaInput.value='';editando=null;btnAgregar.textContent='Agregar';clienteInput.focus()}
function limpiarTodo(){if(confirm('¿Seguro que quieres borrar todos los registros?')){registros=[];guardar();renderizar();limpiarFormulario()}}
function imprimir(){window.print()}
function exportarCSV(){
 let csv='Numero,Cliente,Cedula\n';
 registros.forEach((item,i)=>{csv+=`${i+1},"${(item.cliente||'').replaceAll('"','""')}","${(item.cedula||'').replaceAll('"','""')}"\n`});
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='cheques.csv'; a.click(); URL.revokeObjectURL(url);
}
function formatearCedula(input) {
    // Solo números
    let valor = input.value.replace(/\D/g, "");

    // Máximo 11 dígitos
    valor = valor.substring(0, 11);

    let resultado = "";

    if (valor.length <= 3) {
        resultado = valor;
    } else if (valor.length <= 10) {
        resultado = valor.substring(0, 3) + "-" + valor.substring(3);
    } else {
        resultado =
            valor.substring(0, 3) + "-" +
            valor.substring(3, 10) + "-" +
            valor.substring(10);
    }

    input.value = resultado;
}

let logoBase64Cache = null;

function cargarLogoBase64() {
  if (logoBase64Cache) {
    return Promise.resolve(logoBase64Cache);
  }

  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = function () {
      const canvas = document.createElement("canvas");

      canvas.width = imagen.naturalWidth;
      canvas.height = imagen.naturalHeight;

      const contexto = canvas.getContext("2d");

      contexto.drawImage(imagen, 0, 0);

      logoBase64Cache = canvas.toDataURL("image/png");
      resolve(logoBase64Cache);
    };

    imagen.onerror = function () {
      reject(new Error("No se pudo cargar el logo."));
    };

    imagen.src = "logo.png";
  });
}

async function crearPDFCheques() {
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter"
  });

  const anchoPagina = pdf.internal.pageSize.getWidth();

  /* Logo */
  try {
    const logo = await cargarLogoBase64();

    const anchoLogo = 150;
    const altoLogo = 95;
    const posicionLogoX = (anchoPagina - anchoLogo) / 2;

    pdf.addImage(
      logo,
      "PNG",
      posicionLogoX,
      28,
      anchoLogo,
      altoLogo
    );
  } catch (error) {
    console.warn("El PDF se generará sin logo:", error);
  }

  /* Títulos */
  pdf.setTextColor(8, 40, 92);
  pdf.setFont("times", "bold");
  pdf.setFontSize(16);

  pdf.text(
    "AYUNTAMIENTO DE ESPERANZA",
    anchoPagina / 2,
    142,
    { align: "center" }
  );

  pdf.setFontSize(14);

  pdf.text(
    "CHEQUES",
    anchoPagina / 2,
    162,
    { align: "center" }
  );

  /* Datos de la tabla */
  const filas = registros.map((registro, indice) => [
    indice + 1,
    registro.cliente || "",
    registro.cedula || ""
  ]);

  pdf.autoTable({
    startY: 180,

    head: [
      ["#", "CLIENTE", "CÉDULA"]
    ],

    body: filas,

    theme: "grid",

    margin: {
      left: 45,
      right: 45
    },

    styles: {
      font: "times",
      fontSize: 11,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellPadding: 6,
      valign: "middle"
    },

    headStyles: {
      fillColor: [217, 217, 217],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center"
    },

    columnStyles: {
      0: {
        cellWidth: 38,
        halign: "center"
      },

      1: {
        cellWidth: 310,
        halign: "left"
      },

      2: {
        cellWidth: 174,
        halign: "center"
      }
    },

    didDrawPage: function (data) {
      const numeroPagina = pdf.internal.getNumberOfPages();

      pdf.setFont("times", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(80);

      pdf.text(
        `Página ${numeroPagina}`,
        anchoPagina / 2,
        pdf.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
    }
  });

  return pdf;
}

async function compartirPDF() {
  const boton = document.getElementById("btnCompartirPDF");

  try {
    boton.disabled = true;
    boton.textContent = "Preparando...";

    if (registros.length === 0) {
      alert("Agrega por lo menos un cliente antes de compartir.");
      return;
    }

    const pdf = await crearPDFCheques();
    const pdfBlob = pdf.output("blob");

    const archivo = new File(
      [pdfBlob],
      "cheques-ayuntamiento-esperanza.pdf",
      {
        type: "application/pdf"
      }
    );

    const datosParaCompartir = {
      title: "Cheques - Ayuntamiento de Esperanza",
      text: "Tabla de cheques del Ayuntamiento de Esperanza",
      files: [archivo]
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [archivo] })
    ) {
      await navigator.share(datosParaCompartir);
    } else {
      pdf.save("cheques-ayuntamiento-esperanza.pdf");

      alert(
        "El navegador no permite compartir archivos directamente. " +
        "El PDF fue descargado para que puedas compartirlo."
      );
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
      alert("No se pudo crear o compartir el PDF.");
    }
  } finally {
    boton.disabled = false;
    boton.textContent = "Compartir PDF";
  }
}

document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement!==document.getElementById('buscar'))agregar()});
renderizar();

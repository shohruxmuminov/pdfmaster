import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const freeMaterials = [
  {id:"jurabek-reading-1",title:"IELTS with Jurabek - Reading Test 1",type:"Academic",category:"free",isNew:true,isStatic:true,url:"/reading/IELTSwithJurabek Reading.html"},
  {id:"jurabek-reading-2",title:"IELTS with Jurabek - Reading Test 2",type:"Academic",category:"free",isNew:true,isStatic:true,url:"/reading/IELTSwithJurabek.html"},
  {id:"cdi-reading-full",title:"CDI Full Reading",type:"Academic",category:"free",isNew:true,isStatic:true,url:"/reading/CDI Full reading.html"},
  {id:"cdi-reading-single",title:"CDI Reading",type:"Academic",category:"free",isNew:true,isStatic:true,url:"/reading/CDI Reading.html"}
];

const premiumMaterials = [
  {id:"premium-reading-1",title:"Premium Full Reading 1",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 1.html"},
  {id:"premium-reading-2",title:"Premium Full Reading 2",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek Reading full 2.html"},
  {id:"premium-reading-3",title:"Premium Full Reading 3",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek Full reading 3.html"},
  {id:"premium-reading-4",title:"Premium Full Reading 4",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek Full reading 4.html"},
  {id:"premium-reading-5",title:"Premium Full Reading 5",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek full reading 5.html"},
  {id:"premium-reading-6",title:"Premium Full Reading 6",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 6.html"},
  {id:"premium-reading-7",title:"Premium Full Reading 7",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek Reading full 7.html"},
  {id:"premium-reading-8",title:"Premium Full Reading 8",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/Full reading 8.html"},
  {id:"premium-reading-9",title:"Premium Full Reading 9 (3 Passages)",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/Full Reading 12.html"},
  {id:"premium-reading-10",title:"Premium Full Reading 10",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/Full reading 10.html"},
  {id:"premium-reading-11",title:"Premium Full Reading 11",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/IELTSwithJurabek FULL Reading 11.html"},
  {id:"premium-reading-12",title:"Premium Full Reading 12",type:"Academic",category:"premium",isStatic:true,url:"/reading/premiumreading/Full Reading 12.html"}
];

async function upload() {
  const allMaterials = [...freeMaterials, ...premiumMaterials];
  
  for (const mat of allMaterials) {
    const newMat = {
      name: mat.title,
      category: "Reading", // They are all reading tests
      subCategory: "Reading",
      contentUrl: "https://wisdom2.netlify.app" + mat.url.replace(/ /g, "%20"),
      isHtml: true,
      createdAt: Date.now(),
      isPremium: mat.category === "premium"
    };
    
    // We can just add them to the materials collection
    await setDoc(doc(db, "materials", mat.id), newMat);
    console.log("Added", mat.title);
  }
  console.log("Done!");
  process.exit(0);
}

upload().catch(console.error);

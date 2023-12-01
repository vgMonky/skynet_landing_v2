
////* LOADING *////

/*function to*/

















////* HERO *////

/*function to add img in LANDING GALLERY */
function modelSelector(model){
    const a = document.getElementById(model);
    const i = a.firstChild
    const all = document.querySelectorAll(".model")
    a.addEventListener(
        "mouseover",
        (event) => {
            i.style.opacity="1";
            i.style.cursor="pointer";
        },
        false,
    );

    a.addEventListener(
        "mouseout",
        (event) => {
            i.style.opacity="0";
        },
        false,
    );

    a.addEventListener(
        "click",
        (event) => {
            all[0].style.border= "none";
            all[1].style.border= "none";
            all[2].style.border= "none";
            all[3].style.border= "none";
            all[4].style.border= "none";
            all[5].style.border= "none";
            a.style.border= "2px solid var(--Orange)"
        },
        false,
    );
}

modelSelector("model1")
modelSelector("model2")
modelSelector("model3")
modelSelector("model4")
modelSelector("model5")
modelSelector("model6")
/*  MODEL SELECTOR END */






////* GALLERY *////


/*function to add img in LANDING GALLERY */
function searchedImg(src){
    const landingGallery = document.getElementById("landingGallery")

    var img = document.createElement("img");
    img.src = src;

    img.id = "imgSerch";
    img.className = "col col-4 col-md-3 col-xl-2 landing_img ";

    landingGallery.appendChild(img);
}

/*function to check if img is png*/
function isPngImage(src, timeout = 1000) { // Default timeout of 1000 milliseconds
  return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const signal = controller.signal;

      // Set a timeout to abort the fetch
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      fetch(src, { signal })
          .then(response => {
              clearTimeout(timeoutId); // Clear the timeout
              if (!response.ok) throw new Error('Network response was not ok.');
              return response.blob();
          })
          .then(blob => {
              const reader = new FileReader();
              reader.onloadend = function() {
                  const arr = new Uint8Array(reader.result.slice(0, 8));
                  const pngHeader = [137, 80, 78, 71, 13, 10, 26, 10];
                  const isPng = arr.length === pngHeader.length && arr.every((value, index) => value === pngHeader[index]);
                  resolve(isPng);
              };
              reader.readAsArrayBuffer(blob);
          })
          .catch(error => {
              if (error.name === 'AbortError') {
                  console.error('Fetch aborted due to timeout:', src);
                  resolve(false); // Resolve with false if the request was aborted
              } else {
                  console.error('Fetch error:', error);
                  resolve(false); // Resolve with false instead of rejecting to continue processing
              }
          });
  });
}

/*set Search input by user*/
let inputSearch = "pixel";

/*catch and process data from skygpu search api*/
const apiUrl = 'https://testnet.skygpu.net/v2/skynet/search';

const requestData = {
  prompt: inputSearch,
  size: 200,
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestData),
})
.then(response => response.json())
.then(data => {
  console.log(data);

  async function updateData() {
    const ipfsLink = "https://ipfs.skygpu.net/ipfs/";
    const batchSize = 100; // Number of links to process concurrently

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize); // Get a batch of links
        const promises = batch.map(async (item, index) => {
          return new Promise(async (resolve) => { // Wrapping the promise
              let url = ipfsLink + item.ipfs_hash;
              let isImagePng;
      
              try {
                  isImagePng = await isPngImage(url); 
      
                  if (!isImagePng) {
                      isImagePng = await isPngImage(url + '/image.png');
                      if (isImagePng) {
                          url += '/image.png';
                      }
                  }
      
                  if (!isImagePng) {
                      console.error(`Image at index ${i + index} not found or not a PNG.`);
                      resolve(null); // Resolve with null for skipped items
                      return;
                  }
      
                  item.ipfs_urlImg = url;
                  item.encodedUrl = encodeURIComponent(url);
                  item.thumborUrl150 = `https://thumbor.skygpu.net/unsafe/150x150/${item.encodedUrl}`;
                  searchedImg(item.thumborUrl150);
                  console.log(`${i + index} ${item.thumborUrl150} was added`);
                  resolve(item); // Resolve with the item
              } catch (error) {
                  console.error(`Error processing image at index ${i + index}:`, error);
                  resolve(null); // Resolve with null in case of error
              }
          });
      });
      
      await Promise.all(promises);
    }
    console.log(data);
}
  updateData();

})
.catch(error => console.error('Error:', error));
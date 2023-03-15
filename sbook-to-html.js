const fs = require('fs');
const { parseStringPromise } = require('xml2js');
const { gsap } = require('gsap');

const xmlFilePath = './xml/test-sbook-page.xml';
const htmlFilePath = './output/test-sbook-page.html';

const gsapConfig = {
    img: { duration: 1, x: -200, opacity: 0, ease: 'back' },
    '.text-container p': { duration: 1.2, y: 50, opacity: 0, ease: 'power3.out', delay: 0.5 },
    audio: { duration: 1, y: 100, opacity: 0, ease: 'power2.out', delay: 0.8 },
    '.captions': { duration: 1, x: 100, opacity: 0, ease: 'power1.inOut', stagger: 0.3, delay: 1.1 },
  };
  
  fs.readFile(xmlFilePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
  
    parseStringPromise(data)
      .then((result) => {
        const pageNode = result.root.page_node[0];
        const imageNode = pageNode.image_node[0];
        const textNode = pageNode.text_node[0];
        const audioNode = pageNode.audio_node[0];
        const captions = audioNode.captions_node[0].caption_node;
  
        const captionsHtml = captions
          .map((caption) => `<p class="captions" data-trigger="${caption.$.trigger}">${caption._}</p>`)
          .join('');
  
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageNode.$.title}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
            <style>
              * {
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333;
                background-color: #f8f8f8;
              }
              .container {
                max-width: 960px;
                margin: 0 auto;
                padding: 40px;
              }
              .image-container {
                position: relative;
              }
              .image-container img {
                display: block;
                max-width: 100%;
                height: auto;
              }
              .text-container {
                position: absolute;
                left: 700px;
                top: 150px;
                width: 270px;
                height: 550px;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              }
              .text-container p {
                margin: 0 0 1em 0;
              }
              audio {
                display: block;
                margin: 20px 0;
                width: 100%;
                background-color: #000;
                border-radius: 5px;
              }
              .captions {
                display: block;
                margin: 0;
                padding              : 5px;
                background-color: #000;
                color: #fff;
                font-size: 14px;
                line-height: 1.4;
                border-radius: 5px;
                text-align: center;
              }
              @media screen and (max-width: 768px) {
                .text-container {
                  position: static;
                  width: auto;
                  height: auto;
                  margin: 20px 0;
                }
                .captions p {
                  font-size: 12px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="image-container">
                <img src="${imageNode.$.src}" alt="${imageNode.$.title}">
                <div class="text-container">
                  <p>${textNode._}</p>
                </div>
              </div>
              <audio controls>
                <source src="${audioNode.$.src}" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
              <ul class="captions">${captionsHtml}</ul>
            </div>
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                const gsapConfig = JSON.parse('${JSON.stringify(gsapConfig)}');
  
                gsap.from('img', gsapConfig.img);
                gsap.from('.text-container p', gsapConfig['.text-container p']);
                gsap.from('audio', gsapConfig.audio);
                gsap.from('.captions p', gsapConfig['.captions']);
  
                const audio = document.querySelector('audio');
                const captions = document.querySelectorAll('.captions p');
  
                audio.addEventListener('timeupdate', function() {
                  captions.forEach((caption, index) => {
                    const trigger = parseFloat(caption.getAttribute('data-trigger'));
                    const nextTrigger = index < captions.length - 1 ? parseFloat(captions[index + 1].getAttribute('data-trigger')) : audio.duration;
  
                    if (audio.currentTime >= trigger && audio.currentTime < nextTrigger) {
                      caption.style.display = 'block';
                    } else {
                      caption.style.display = 'none';
                    }
                  });
                });
              });
            </script>
          </body>
          </html>
        `;
  
        fs.writeFile(htmlFilePath, html, function (err) {
          if (err) {
            console.error(err);
            return;
          }
  
          console.log(`HTML file saved to ${htmlFilePath}`);
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });

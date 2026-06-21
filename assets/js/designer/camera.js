// ===== 拍照功能 =====

const DesignerCamera = {
  stream: null,
  videoElement: null,

  // 开启摄像头
  async start() {
    const modal = document.getElementById('camera-modal');
    this.videoElement = document.getElementById('camera-video');

    if (!modal || !this.videoElement) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      modal.classList.add('active');

      // 绑定按钮
      document.getElementById('camera-capture')?.addEventListener('click', () => this.capture());
      document.getElementById('camera-cancel')?.addEventListener('click', () => this.stop());
    } catch (error) {
      console.error('无法访问摄像头:', error);
      alert('无法访问摄像头，请检查权限设置。');
    }
  },

  // 拍照
  capture() {
    if (!this.videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0);

    // 压缩图片
    const maxSize = 800;
    let width = canvas.width;
    let height = canvas.height;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }

    const compressedCanvas = document.createElement('canvas');
    compressedCanvas.width = width;
    compressedCanvas.height = height;
    const compressedCtx = compressedCanvas.getContext('2d');
    compressedCtx.drawImage(canvas, 0, 0, width, height);

    const dataUrl = compressedCanvas.toDataURL('image/jpeg', 0.8);

    // 创建照片元素
    const element = DesignerElements.createPhotoElement(dataUrl, 150, 100, 150, 120);
    if (element) {
      DesignerCanvas.addElement(element);
    }

    this.stop();
  },

  // 停止摄像头
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    const modal = document.getElementById('camera-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
};

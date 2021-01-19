// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    var exportModal = document.getElementById("modal");
    if (event.target === exportModal) {
      exportModal.style.display = "none";
    }
  }


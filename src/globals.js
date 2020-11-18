// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    var modal = document.getElementById("modal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


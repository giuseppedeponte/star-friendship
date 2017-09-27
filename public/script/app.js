window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('uname').addEventListener('keyup', function(e) {
    document.getElementById('avatar').src = 'https://api.adorable.io/avatars/129/' + this.value;
  });
});

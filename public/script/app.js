if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

$(function() {
  // NAV COLLAPSE
  var nav = document.getElementById('nav');
  var navScrollY = $('header').offset().top + $('header').height();
  $(window).on('scroll', function(e) {
    if (navScrollY <= window.scrollY) {
      $(nav).addClass('top');
    } else {
      $(nav).removeClass('top');
    }
  });
  // USER FORM
  var uvalidate = function(name) {
    if (name !== '') {
      $('#uform .alert').hide();
      $('.avatar img')
        .attr('src', 'https://api.adorable.io/avatars/75/' + name.split(' ').join('-'));
      $('#uform input[type="submit"]').attr('disabled', false).removeClass('disabled');
      return true;
    } else {
      $('#uform .alert').show();
      $('.avatar img').attr('src', '');
      $('#uform input[type="submit"]').attr('disabled', true).addClass('disabled');
      return false;
    }
  }
  $('#uname').val('');
  $('#uform .alert').hide().removeClass('hide');
  $('#uform input[type="submit"]').attr('disabled', true);
  $('#uname').on('keyup', function() {
    var name = this.value.trim().toLowerCase();
    uvalidate(name);
  });
  $('#uform').on('submit', function(e) {
    e.preventDefault();
    var name = $('#uname').val().trim().toLowerCase();
    if (uvalidate(name)) {
      var user = {
        connected_at: new Date(),
        name: name
      };
      this.submit();
    }
  });
  // GAME
});

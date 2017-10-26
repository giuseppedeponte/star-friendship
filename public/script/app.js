if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
var capitalize = function(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

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
    $('#uform .alert').hide();
    if (name !== '' && name.length <= 40) {
      $('.avatar img')
        .attr('src', 'https://api.adorable.io/avatars/75/' + name.split(' ').join('-'));
      $('#uform input[type="submit"]').attr('disabled', false).removeClass('disabled');
      return true;
    } else {
      if (name.length > 40) {
        $('#uform .alert .text').text('Sorry, you must choose a name shorter than 40 characters…');
      } else {
        $('#uform .alert .text').text('Sorry, you must choose a name to play (it does not have to be your REAL name, though)…');
      }
      $('#uform .alert').show();
      $('.avatar img').attr('src', '');
      $('#uform input[type="submit"]').attr('disabled', true).addClass('disabled');
      return false;
    }
  }
  $('#uname').val('');
  $('#uform input[type="submit"]').attr('disabled', true);
  $('#uname').on('keyup', function() {
    var name = this.value.trim().toLowerCase();
    uvalidate(name);
  });
  $('#uform').on('submit', function(e) {
    e.preventDefault();
    var name = $('#uname').val().trim().toLowerCase();
    if (uvalidate(name)) {
      $('#uname').val(capitalize(name));
      this.submit();
    }
  });
});

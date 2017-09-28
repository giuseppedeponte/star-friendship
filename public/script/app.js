if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

$(function() {
  // UFORM
  $('#uname').val('');
  $('#uform .alert').hide().removeClass('hide');
  $('#uform input[type="submit"]').attr('disabled', true);
  $('#uname').on('keyup', function() {
    var name = this.value.trim().toLowerCase();
    if (name !== '') {
      $('#uform .alert').hide();
      $('#avatarImg')
        .attr('src', 'https://api.adorable.io/avatars/75/' + name.split(' ').join('-'));
      $('#uform input[type="submit"]').attr('disabled', false);
    } else {
      $('#uform .alert').show();
      $('#avatarImg').attr('src', '');
      $('#uform input[type="submit"]').attr('disabled', true);
    }
  });
  $('#uform').on('submit', function(e) {
    e.preventDefault();
    console.table({
      connected_at: new Date(),
      name: $('#uname').val().trim()
    });
    // send data to the server
    e.currentTarget.submit();
  });
});

import re

path = r'e:\Code\wasel-water\backend\templates\accounts\otp_login.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove toggle CSS
text = re.sub(r'\s*/\*\s*Login Toggle\s*\*/.*?(?=\s*/\*\s*Input with Icon Group\s*\*/)', '\n', text, flags=re.DOTALL)

html_replacement = '''    <!-- Step 1: Login Choice (Email or Phone) -->
    <div id=\"step-unified\" class=\"otp-card\">
        <div class=\"otp-header\">
            {% if company.logo %}
            <img src=\"{{ company.logo.url }}\" alt=\"{{ company.name }}\" class=\"otp-logo\">
            {% endif %}
            <h1>تسجيل الدخول بشكل أسرع</h1>
            <p>سجّل دخولك للمتابعة</p>
        </div>

        <div id=\"form-unified\">
            <div id=\"pw-step-identifier\">
                <div class=\"apple-field-group\" id=\"apple-identifier-group\">
                    <label class=\"apple-field-label\" for=\"input-identifier\">البريد الإلكتروني أو رقم الهاتف</label>
                    <div class=\"apple-field-wrap\">
                        <input type=\"text\" id=\"input-identifier\"
                               class=\"apple-field-input\"
                               placeholder=\"البريد الإلكتروني أو رقم الهاتف\"
                               autocomplete=\"username\" dir=\"ltr\">
                    </div>
                </div>

                <!-- Password field – hidden initially -->
                <div class=\"apple-field-group apple-pw-field hidden\" id=\"apple-password-group\">
                    <label class=\"apple-field-label\" for=\"input-password\">كلمة المرور</label>
                    <div class=\"apple-field-wrap\">
                        <input type=\"password\" id=\"input-password\"
                               class=\"apple-field-input\"
                               placeholder=\"••••••••\"
                               autocomplete=\"current-password\">
                        <button type=\"button\" id=\"btn-toggle-pw\" class=\"apple-pw-toggle\" tabindex=\"-1\" aria-label=\"إظهار كلمة المرور\">
                            <i class=\"bi bi-eye\" id=\"pw-eye-icon\"></i>
                        </button>
                    </div>
                </div>

                <div id=\"unified-error\" class=\"text-danger small mt-2 hidden\" style=\"margin-bottom: 12px; text-align: right;\"></div>

                <div class=\"form-check mt-3\" style=\"text-align: right; display: flex; align-items: center; gap: 8px; justify-content: flex-start;\">
                    <input class=\"form-check-input m-0\" type=\"checkbox\" value=\"\" id=\"rememberMe\" checked style=\"width: 18px; height: 18px; cursor: pointer;\">
                    <label class=\"form-check-label m-0\" for=\"rememberMe\" style=\"font-size: 0.95rem; color: var(--otp-text-main); cursor: pointer; padding-top: 1px;\">
                        تذكرني
                    </label>
                </div>

                <button id=\"btn-unified-continue\" class=\"btn-submit mt-3\" disabled>
                    <span class=\"btn-text\">متابعة</span>
                    <div class=\"loader\"></div>
                </button>

                <div class=\"text-center mt-4 d-flex flex-column gap-3\" style=\"align-items: center;\">
                    <a href=\"#\" class=\"apple-forgot-link\" id=\"btn-forgot-pw\">هل نسيت كلمة السر؟ <i class=\"bi bi-arrow-left-short\"></i></a>
                    <a href=\"{% url 'accounts:register' %}\" class=\"apple-forgot-link\">ليس لديك حساب؟ إنشاء حساب خاص بك <i class=\"bi bi-arrow-left-short\"></i></a>
                </div>
            </div>
        </div>

        <!-- Google Login -->
        <div class=\"social-login mt-4\">
            <div class=\"divider\"><span>أو</span></div>
            <a href=\"{% url 'google_login' %}\" class=\"btn-google\">
                <img src=\"https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png\" class=\"google-icon\" alt=\"Google\">
                <span>المتابعة عبر جوجل</span>
            </a>
        </div>

        <div class=\"divider\"></div>
        <a href=\"{% url 'home' %}\" class=\"guest-link\">المتابعة كزائر</a>
    </div>'''

text = re.sub(r'    <!-- Step 1: Login Choice \(Phone or Password\) -->\s*<div id=\"step-phone\".*?<a href=\"{% url \'home\' %}\" class=\"guest-link\">المتابعة كزائر</a>\s*</div>', lambda m: html_replacement, text, flags=re.DOTALL)

js_replacement = '''<script>
    $(document).ready(function() {
        const stepUnified = $('#step-unified');
        const stepOtp = $('#step-otp');
        const inputIdentifier = $('#input-identifier');
        const inputPassword = $('#input-password');
        const errorDiv = $('#unified-error');
        const btnContinue = $('#btn-unified-continue');
        
        const pwGroup = $('#apple-password-group');
        const pwLabel = pwGroup.find('.apple-field-label');
        const identifierLabel = $('#apple-identifier-group .apple-field-label');
        
        let pwVisible = false;
        let isPhoneMode = false;
        let activePhoneValue = '';

        const otpInputs = $('.otp-digit');
        const btnVerifyOtp = $('#btn-verify-otp');
        const displayPhone = $('#display-phone');
        const resendLink = $('#btn-resend');
        const timerSpan = $('#timer');
        let countdown;

        // CSRF Token
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        const csrftoken = getCookie('csrftoken');

        // Float label when input has value
        function updateLabel(input, label) {
            if (input.val().trim()) {
                label.addClass('floated');
            } else {
                label.removeClass('floated');
            }
        }

        // Identifier Input handler
        inputIdentifier.on('input focus', function() {
            // allow english nums and letters
            updateLabel($(this), identifierLabel);
            const val = $(this).val().trim();
            btnContinue.prop('disabled', val.length === 0);
            errorDiv.addClass('hidden');
        });

        inputPassword.on('input focus', function() {
            updateLabel($(this), pwLabel);
            errorDiv.addClass('hidden');
        });

        // Show/hide password toggle
        $('#btn-toggle-pw').on('click', function() {
            const type = inputPassword.attr('type') === 'password' ? 'text' : 'password';
            inputPassword.attr('type', type);
            $('#pw-eye-icon').toggleClass('bi-eye bi-eye-slash');
        });

        // Continue Button Logic
        btnContinue.on('click', function() {
            const val = inputIdentifier.val().trim();
            errorDiv.addClass('hidden');

            if (!val) {
                errorDiv.text('يرجى إدخال البريد الإلكتروني أو رقم الهاتف').removeClass('hidden');
                inputIdentifier.focus();
                return;
            }

            // Check if input looks like a phone number (all digits)
            const isAllDigits = /^\\d+$/.test(val);

            if (!pwVisible) {
                if (isAllDigits) {
                    // Treat as Phone Number
                    let phoneNum = val;
                    // Auto correct 05 -> 5
                    if (phoneNum.startsWith('05')) {
                        phoneNum = phoneNum.substring(1);
                        inputIdentifier.val(phoneNum); // update visual
                    }
                    
                    if (!phoneNum.startsWith('5') || phoneNum.length !== 9) {
                        errorDiv.text('يرجى إدخال رقم جوال سعودي صحيح (مثال: 5xxxxxxxx)').removeClass('hidden');
                        return;
                    }

                    isPhoneMode = true;
                    activePhoneValue = phoneNum;
                    const fullPhone = '+966' + phoneNum;
                    
                    setLoading(btnContinue, true);

                    fetch('{% url "accounts:otp_request" %}', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                        body: JSON.stringify({ phone: fullPhone })
                    })
                    .then(res => res.json())
                    .then(data => {
                        setLoading(btnContinue, false);
                        if (data.success) {
                            switchToOtp(fullPhone);
                        } else {
                            errorDiv.text(data.error).removeClass('hidden');
                        }
                    })
                    .catch(err => {
                        setLoading(btnContinue, false);
                        errorDiv.text('حدث خطأ ما، يرجى المحاولة لاحقاً').removeClass('hidden');
                    });

                } else {
                    // Treat as Email / Username -> Reveal Password
                    isPhoneMode = false;
                    $('#apple-identifier-group .apple-field-wrap').css('border-radius', '12px 12px 0 0');
                    pwGroup.removeClass('hidden').addClass('visible');
                    pwVisible = true;
                    btnContinue.find('.btn-text').text('تسجيل الدخول');
                    setTimeout(() => { inputPassword.focus(); }, 350);
                }
                return;
            }

            // If pw is visible, we are logging in via username/password
            if (pwVisible && !isPhoneMode) {
                const password = inputPassword.val();
                if (!password) {
                    errorDiv.text('يرجى إدخال كلمة المرور').removeClass('hidden');
                    inputPassword.focus();
                    return;
                }

                setLoading(btnContinue, true);

                fetch('{% url "accounts:traditional_login" %}' + window.location.search, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify({ username: val, password: password })
                })
                .then(res => res.json())
                .then(data => {
                    setLoading(btnContinue, false);
                    if (data.success) {
                        window.location.href = data.redirect_url;
                    } else {
                        errorDiv.text(data.error).removeClass('hidden');
                        pwGroup.find('.apple-field-wrap').css('border-color','#ff3b30');
                        setTimeout(() => pwGroup.find('.apple-field-wrap').css('border-color',''), 1200);
                    }
                })
                .catch(() => {
                    setLoading(btnContinue, false);
                    errorDiv.text('حدث خطأ فني، يرجى المحاولة لاحقاً').removeClass('hidden');
                });
            }
        });

        // Allow Enter key to trigger button
        inputIdentifier.on('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); btnContinue.trigger('click'); }
        });
        inputPassword.on('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); btnContinue.trigger('click'); }
        });

        // --- OTP Logic ---
        otpInputs.on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length === 1) {
                $(this).next('.otp-digit').focus();
            }
            checkOtpComplete();
        });

        otpInputs.on('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0) {
                $(this).prev('.otp-digit').focus();
            }
        });

        function checkOtpComplete() {
            let complete = true;
            otpInputs.each(function() {
                if (this.value.length === 0) complete = false;
            });
            btnVerifyOtp.prop('disabled', !complete);
            if (complete) {
                // Auto verify
                verifyOtp();
            }
        }

        btnVerifyOtp.on('click', verifyOtp);

        function verifyOtp() {
            let code = '';
            otpInputs.each(function() { code += this.value; });
            const fullPhone = '+966' + activePhoneValue;

            setLoading(btnVerifyOtp, true);

            fetch('{% url "accounts:otp_verify" %}' + (window.location.search), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify({ phone: fullPhone, code: code })
            })
            .then(res => res.json())
            .then(data => {
                setLoading(btnVerifyOtp, false);
                if (data.success) {
                    window.location.href = data.redirect_url;
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'فشل التحقق',
                        text: data.error,
                        confirmButtonColor: '#00b4d8'
                    });
                    otpInputs.val('');
                    otpInputs.first().focus();
                }
            })
            .catch(err => {
                setLoading(btnVerifyOtp, false);
            });
        }

        // Navigation
        function switchToOtp(phone) {
            stepUnified.addClass('hidden');
            stepOtp.removeClass('hidden');
            displayPhone.text(phone);
            otpInputs.first().focus();
            startTimer(60);
        }

        $('#btn-back').on('click', function(e) {
            e.preventDefault();
            stepOtp.addClass('hidden');
            stepUnified.removeClass('hidden');
            clearInterval(countdown);
        });

        // Resend OTP
        resendLink.on('click', function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) return;
            
            const fullPhone = '+966' + activePhoneValue;
            fetch('{% url "accounts:otp_request" %}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify({ phone: fullPhone })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    startTimer(60);
                    Swal.fire({
                        toast: true,
                        position: 'top',
                        icon: 'success',
                        title: 'تم إعادة إرسال الكود',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            });
        });

        // Utils
        function setLoading(btn, isLoading) {
            const text = btn.find('.btn-text');
            const loader = btn.find('.loader');
            if (isLoading) {
                text.hide();
                loader.show();
                btn.prop('disabled', true);
            } else {
                text.show();
                loader.hide();
                btn.prop('disabled', false);
            }
        }

        function startTimer(seconds) {
            resendLink.addClass('disabled');
            let timeLeft = seconds;
            updateTimerDisplay(timeLeft);
            
            clearInterval(countdown);
            countdown = setInterval(function() {
                timeLeft--;
                updateTimerDisplay(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    resendLink.removeClass('disabled');
                    timerSpan.text('');
                }
            }, 1000);
        }

        function updateTimerDisplay(s) {
            const min = Math.floor(s / 60);
            const sec = s % 60;
            timerSpan.text(`(${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')})`);
        }

        $('#btn-forgot-pw').on('click', function(e) {
            e.preventDefault();
            Swal.fire({ icon: 'info', title: 'نسيت كلمة المرور؟', text: 'يرجى التواصل مع مدير النظام أو استخدام الدخول السريع عبر رقم الجوال.', confirmButtonColor: '#004d7a' });
        });
    });
</script>'''

text = re.sub(r'<script>\s*\$\(document\)\.ready\(function\(\) \{.*?\}\);\s*</script>', lambda m: js_replacement, text, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Success')

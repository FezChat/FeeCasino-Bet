// components/footer.js
export function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    footerContainer.innerHTML = `
        <footer class="main-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>FeeCasino Bet</h4>
                    <p>Mock betting platform for entertainment purposes only. No real money involved.</p>
                    <div class="warning-badge">
                        <i class="fas fa-exclamation-triangle"></i>
                        FAKE MONEY ONLY
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="#" onclick="showComingSoon()">About Us</a></li>
                        <li><a href="#" onclick="showComingSoon()">Terms & Conditions</a></li>
                        <li><a href="#" onclick="showComingSoon()">Privacy Policy</a></li>
                        <li><a href="#" onclick="showComingSoon()">Responsible Gaming</a></li>
                        <li><a href="#" onclick="showComingSoon()">FAQ</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contact & Support</h4>
                    <ul class="footer-links">
                        <li><a href="tel:+255752593977"><i class="fas fa-phone"></i> +255 752 593 977</a></li>
                        <li><a href="https://wa.me/255752593977?text=Hi" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a></li>
                        <li><a href="mailto:support@feecasino.fake" onclick="showComingSoon()"><i class="fas fa-envelope"></i> support@feecasino.fake</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Follow Us</h4>
                    <div class="social-links">
                        <a href="https://www.instagram.com/@frediezra" target="_blank" class="social-link">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.facebook.com/@FrediEzra" target="_blank" class="social-link">
                            <i class="fab fa-facebook"></i>
                        </a>
                        <a href="https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f" target="_blank" class="social-link">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <a href="https://chat.whatsapp.com/KERPI5K0w0L9rzU00QSw40?mode=hqrt1" target="_blank" class="social-link">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <a href="https://thread.com/@frediezra" target="_blank" class="social-link">
                            <i class="fab fa-threads"></i>
                        </a>
                        <a href="https://twitter.com/@frediezra" target="_blank" class="social-link">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://tiktok.com/frediezra1" target="_blank" class="social-link">
                            <i class="fab fa-tiktok"></i>
                        </a>
                        <a href="https://youtube.com/FrediAi-tech" target="_blank" class="social-link">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${currentMonth} ${currentYear} FeeCasino Bet. This is a mock platform for demonstration purposes only. NOT FOR REAL MONEY GAMBLING.</p>
                <p class="footer-warning">
                    <i class="fas fa-exclamation-circle"></i>
                    WARNING: This application uses fake money only. No real financial transactions occur.
                </p>
            </div>
        </footer>
        
        <style>
            .main-footer {
                background-color: var(--color-secondary);
                margin-top: var(--spacing-2xl);
                padding: var(--spacing-xl) var(--spacing-lg);
            }
            
            .footer-content {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-xl);
                margin-bottom: var(--spacing-xl);
            }
            
            .footer-section h4 {
                color: var(--color-primary);
                margin-bottom: var(--spacing-md);
                font-size: var(--font-size-lg);
            }
            
            .footer-links {
                list-style: none;
                padding: 0;
            }
            
            .footer-links li {
                margin-bottom: var(--spacing-sm);
            }
            
            .footer-links a {
                color: var(--color-gray);
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                transition: color 0.2s ease;
            }
            
            .footer-links a:hover {
                color: var(--color-primary);
            }
            
            .social-links {
                display: flex;
                gap: var(--spacing-sm);
                flex-wrap: wrap;
            }
            
            .social-link {
                width: 40px;
                height: 40px;
                background-color: var(--color-dark);
                border-radius: var(--border-radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-light);
                font-size: var(--font-size-lg);
                transition: all 0.2s ease;
            }
            
            .social-link:hover {
                background-color: var(--color-primary);
                transform: translateY(-2px);
            }
            
            .footer-bottom {
                max-width: 1200px;
                margin: 0 auto;
                padding-top: var(--spacing-lg);
                border-top: 1px solid var(--color-gray-dark);
                text-align: center;
                color: var(--color-gray);
                font-size: var(--font-size-sm);
            }
            
            .footer-warning {
                margin-top: var(--spacing-md);
                padding: var(--spacing-md);
                background-color: rgba(245, 158, 11, 0.1);
                border-radius: var(--border-radius-md);
                color: var(--color-warning);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-sm);
            }
            
            .warning-badge {
                display: inline-flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) var(--spacing-md);
                background-color: rgba(245, 158, 11, 0.2);
                color: var(--color-warning);
                border-radius: var(--border-radius-md);
                font-size: var(--font-size-sm);
                font-weight: 600;
                margin-top: var(--spacing-md);
            }
        </style>
    `;
}

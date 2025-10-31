// wemovies.spec.ts
import { test, expect } from '@playwright/test';

// Define a URL base para usar nos testes
const BASE_URL = 'http://wemovies-qa.s3-website.us-east-2.amazonaws.com/';

test.describe('Fluxo Completo de Compra - WeMovies', () => {

    test('2.5: Deve adicionar um produto, finalizar a compra e visualizar a tela de sucesso', async ({ page }) => {
        // --- Setup: Navegar para a pagina principal ---
        await page.goto(BASE_URL);

        // --- Ação 1: Adicionar o Primeiro Filme ao Carrinho (Cenário 1.2) ---
        
        // Seletor para o primeiro botão "Adicionar ao Carrinho" 
        const primeiroFilmeButton = page.locator('button:has-text("Adicionar ao Carrinho")').first();
        
        // Captura o preço do primeiro filme para validação posterior
        const precoFilmeText = await page.locator('.product-card').first().locator('.price').innerText();
        const precoFilme = parseFloat(precoFilmeText.replace('R$ ', '').replace(',', '.'));

        await primeiroFilmeButton.click();
        
        // Critério de Aceitação 1.2: O botão deve mudar para '1 no Carrinho'
        await expect(primeiroFilmeButton).toHaveText(/1 no Carrinho/i);

        // Critério de Aceitação 1.2: O contador do Carrinho no Header deve ser '1'
        await expect(page.locator('.cart-item-count')).toHaveText('1');


        // Ação 2: Navegar para o Carrinho 
        await page.locator('.cart-link').click(); // Seletor para o link/ícone do Carrinho no Header
        
        // Critério de Aceitação: Deve estar na tela do Carrinho
        await expect(page).toHaveURL(/.*carrinho/);
        await expect(page.locator('h1')).toHaveText('Carrinho');

        
        //  Ação 3: Aumentar a quantidade (Cenário 2.2)
        
        // Seletor para o botão de incremento de quantidade (icone '+')
        const incrementButton = page.locator('.quantity-control button').nth(1); 
        await incrementButton.click();

        // A quantidade deve ser '2'
        const quantidadeInput = page.locator('.quantity-control input');
        await expect(quantidadeInput).toHaveValue('2');
        
        // O Total deve ser o dobro do preço inicial (2 * preçoFilme)
        const totalCarrinho = page.locator('.total-price-value');
        const precoEsperado = (precoFilme * 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        await expect(totalCarrinho).toHaveText(`R$ ${precoEsperado}`);


        // Ação 4: Finalizar Compra (Cenario 2.5)
        const finalizarCompraButton = page.locator('button:has-text("Finalizar Compra")');
        await finalizarCompraButton.click();
        
        // Deve navegar para a tela de Sucesso
        await expect(page).toHaveURL(/.*sucesso/);
        
        // A mensagem de Sucesso deve ser exibida
        await expect(page.locator('h1')).toHaveText('Compra realizada com sucesso!');
        await expect(page.locator('img[alt="Sucesso"]')).toBeVisible();

        // Ação 5: Voltar para Home
        await page.locator('button:has-text("Voltar")').click();
        
        // Deve retornar à Home
        await expect(page).toHaveURL(BASE_URL);
        
        // O carrinho deve estar vazio (indicador 0 no Header)
        await expect(page.locator('.cart-item-count')).toHaveText('0');
    });
});
import datetime
import json

from django.shortcuts import render
from django.contrib import messages
from rest_framework import generics
# from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


from .serializers import *


"""                 //////////////////\\\\\\\\\\\\\\\\\\
                   (||||||||||||[[( AUTH )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\\//////////////////
"""

def registerUser(request):
    username = request.POST['username']
    password = request.POST['password1']
    user = User.objects.create_user(username, username, password)

    login(request, user)

    lsCart = json.loads(request.POST['ls-cart'])
    if len(lsCart) > 0:
                order, createdO = Order.objects.get_or_create(user=user, complete=False)
                if createdO:
                    for item in lsCart:
                        product = Product.objects.get(id=item['id'])
                        orderItem, createdI = OrderItem.objects.get_or_create(order=order, product=product)
                        if createdI:
                            if int(item['qty']) > product.moq:
                                orderItem.quantity = int(item['qty'])
                            else:
                                orderItem.quantity = product.moq
                            orderItem.save()
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def loginUser(request):
    username = request.POST['username']
    password = request.POST['password']
    lsCart = json.loads(request.POST['ls-cart'])

    user = authenticate(request, username=username, password=password)

    if user is not None:
        if user.is_active:
            login(request, user)
            messages.success(request, f"Successufully logged in as {username}")

            if len(lsCart) > 0:
                order, createdO = Order.objects.get_or_create(user=user, complete=False)
                if createdO:
                    for item in lsCart:
                        product = Product.objects.get(id=item['id'])
                        orderItem, createdI = OrderItem.objects.get_or_create(order=order, product=product)
                        if createdI:
                            if int(item['qty']) > product.moq:
                                orderItem.quantity = int(item['qty'])
                            else:
                                orderItem.quantity = product.moq
                            orderItem.save()
        else:
            messages.error(request, "Inactive User")
            return HttpResponse("Inactive user.")
    else:
        messages.error(request, "Login error: incorrect email or password. Please try again.")

    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def logoutUser(request):
    if request.method == 'POST':
        logout(request)
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))




"""                 ////////////////// \\\\\\\\\\\\\\\\\\
                   (||||||||||||[[( PAGES )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\\ //////////////////
"""
def checkout(request):
    if request.user.is_authenticated:
        if request.method == 'POST':
            data = request.POST
            try:
                ShippingAddress.objects.filter(user=request.user).update(
                    company=data["company"],
                    address1=data["address1"],
                    address2=data["address2"],
                    city=data["city"],
                    pincode=data["pincode"],
                    state=data["state"],
                    country=data["country"]
                )
                
            except ShippingAddress.DoesNotExist:
                newAddress = ShippingAddress(
                    user=request.user,
                    company=data["company"],
                    address1=data["address1"],
                    address2=data["address2"],
                    city=data["city"],
                    pincode=data["pincode"],
                    state=data["state"],
                    country=data["country"]
                )
                newAddress.save()

        user = request.user
        order, created = Order.objects.get_or_create(user=user, complete=False)
        items = order.items.all()
        try:
            shipping = ShippingAddress.objects.get(id=user.id)
        except ShippingAddress.DoesNotExist:
            shipping = False
    else:
        items = []
        order = {"get_cart_total": 0, "get_cart_items": 0}
        shipping = False

    context = {"items": items, "order": order, "customer": shipping}
    return render(request, 'store/checkout.html', context)



"""                 ///////////////// \\\\\\\\\\\\\\\\\
                   (||||||||||||[[( API )]]||||||||||||)
                    \\\\\\\\\\\\\\\\\ /////////////////
"""

class ListProducts(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# class CreateProduct(generics.CreateAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [IsAdminUser]

# class RUDProduct(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer
#     permission_classes = [IsAdminUser]

# class RUDCart(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Customer.objects.all()
#     serializer_class = CartSerializer

@api_view(['GET'])
def ProductInfo(request, pk):
    product = Product.objects.get(id=pk)
    serializer = ProductFullSerializer(product)
    return Response(serializer.data)
    

@api_view(['GET'])
def getCart(request, pk):
    try:
        cart = Order.objects.filter(user=pk).get(complete=False)
        serializer = OrderSerializer(cart)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return JsonResponse({'items':[]}, safe=False)


@api_view(['POST'])
def addItem(request):
    userId = request.data["userId"]
    productId = request.data["id"]
    # moq = request.data["moq"]
    addValue = request.data["n"]
    if addValue > 0:
        product = Product.objects.get(id=productId)
        user = User.objects.get(id=userId)
        
        order, createdO = Order.objects.get_or_create(user=user, complete=False)

        orderItem, createdI = OrderItem.objects.get_or_create(order=order, product=product)
        if createdI:
            if addValue > product.moq:
                orderItem.quantity = addValue
            else:
                orderItem.quantity = product.moq
        else:
            orderItem.quantity = orderItem.quantity + addValue
    
    orderItem.save()

    # return JsonResponse({cartCount: order.get_cart_items}, safe=False)
    return JsonResponse({"iId": orderItem.id})


@api_view(['POST'])
def updateItem(request):
    userId = request.data["userId"]
    itemId = request.data["itemId"]
    productId = request.data["productId"]
    newValue = request.data["n"]

    orderItem = OrderItem.objects.get(id=itemId)
    product = Product.objects.get(id=productId)

    if orderItem.order.complete == False and int(userId) == orderItem.order.user.id and newValue >= product.moq:
        orderItem.quantity = newValue
        orderItem.save()
        return JsonResponse({"quantity": orderItem.quantity})
    
    return JsonResponse("error in updateItem", safe=False)


@api_view(['POST'])
def removeItem(request):
    userId = request.data["userId"]
    itemId = request.data["itemId"]

    orderItem = OrderItem.objects.get(id=itemId)
    order = Order.objects.get(id=orderItem.order.id)

    if order.complete == False and int(userId) == order.user.id:
        orderItem.delete()
        return JsonResponse("Removed", safe=False)

    return JsonResponse("error in removeItem", safe=False)


def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = request.POST

    if request.user.is_authenticated:
        user = request.user.user
        order = Order.objects.get(user=user, complete=False)
        
        order.transaction_id = transaction_id
        order.complete = True
        order.save()
        
    return JsonResponse('Payment Complete', safe=False)